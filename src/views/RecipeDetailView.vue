<template>
  <div class="recipe-detail">
    <div v-if="recipe" class="detail-container">

      <div v-if="recipe.imageUrl" class="image-section">
        <img :src="recipe.imageUrl" :alt="recipe.title" class="recipe-image" :style="{ opacity: isUploading ? 0.5 : 1 }" />
        <div v-if="isUploading" style="position:absolute; color: white; background: rgba(0,0,0,0.5); padding: 5px;">Lädt...</div>
      </div>

      <div class="title-section">
        <h1>{{ recipe.title }}</h1>
        <div class="action-buttons">
          <button
            @click="triggerImageUpload"
            class="camera-btn-detail"
            title="Foto hinzufügen oder ändern"
            :disabled="isUploading"
          >
            <svg class="camera-icon-detail" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M213.1 128.8L202.7 160L128 160C92.7 160 64 188.7 64 224L64 480C64 515.3 92.7 544 128 544L512 544C547.3 544 576 515.3 576 480L576 224C576 188.7 547.3 160 512 160L437.3 160L426.9 128.8C420.4 109.2 402.1 96 381.4 96L258.6 96C237.9 96 219.6 109.2 213.1 128.8zM320 256C373 256 416 299 416 352C416 405 373 448 320 448C267 448 224 405 224 352C224 299 267 256 320 256z"/>
            </svg>
          </button>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            class="file-input-hidden"
          />

          <button
            @click="toggleFavorite"
            class="favorite-btn-detail"
            :class="{ 'is-favorite': recipe.isFavorite }"
          >
             <img :src="recipe.isFavorite ? heartSolidFull : heartRegularFull" alt="Herz" class="heart-icon-detail"/>
          </button>
        </div>
      </div>

      <div class="section">
        <h2>Zutaten</h2>
        <p>{{ recipe.ingredients }}</p>
      </div>

      <div class="section">
        <h2>Anleitung</h2>
        <p>{{ recipe.instructions }}</p>
      </div>

      <div class="actions">
        <div class="main-actions">
        <router-link :to="`/edit/${recipe.id}`" class="btn btn-edit">Bearbeiten</router-link>
        <button @click="confirmDelete" class="btn btn-delete">Löschen</button>
        </div>
        <router-link to="/" class="btn btn-back">Zurück</router-link>
      </div>
    </div>
    <div v-else>
      <p>Rezept nicht gefunden</p>
    </div>
  <CookingModeCard
        :step-count="steps.length"
        @start="isCookingModeActive = true"
  />
  </div>
  <CookingModeOverlay
      :is-open="isCookingModeActive"
      :steps="steps"
      :ingredients="recipe ? recipe.ingredients : ''"
      @close="isCookingModeActive = false"
    />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipeStore'
import type { Recipe } from '@/types/Recipe'
import heartSolidFull from '@/assets/Icons/heart-solid-full.svg'
import heartRegularFull from '@/assets/Icons/heart-regular-full.svg'
import { storage, auth } from '../../firebase'
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import CookingModeOverlay from '@/components/CookingModeOverlay.vue'
import CookingModeCard from '@/components/CookingModeCard.vue'

const route = useRoute()
const router = useRouter()
const recipeStore = useRecipeStore()
const recipe = ref<Recipe | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const isCookingModeActive = ref(false)

const triggerImageUpload = () => {
  fileInput.value?.click()
}

const compressImage = async (file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        let width = img.width
        let height = img.height
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Error compressing image'))
        }, 'image/jpeg', quality)
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0] && recipe.value) {
    const file = input.files[0]

    if (!auth.currentUser) {
      alert('Bitte melde dich an, um ein Bild hochzuladen.')
      return
    }

    try {
      isUploading.value = true

      const compressedBlob = await compressImage(file)

      const path = `recipes/${auth.currentUser.uid}/${Date.now()}_${file.name.replace(/\.[^/.]+$/, "")}.jpg`
      const storageRef = sRef(storage, path)

      await uploadBytes(storageRef, compressedBlob)

      const downloadUrl = await getDownloadURL(storageRef)

      recipe.value.imageUrl = downloadUrl

      await updateRecipeImage()

    } catch (err) {
      console.error('Fehler beim Upload:', err)
      alert('Fehler beim Hochladen.')
    } finally {
      isUploading.value = false
    }
  }
}

const updateRecipeImage = async () => {
  if (!recipe.value?.id) return
  try {
    await recipeStore.updateRecipe(recipe.value.id, { imageUrl: recipe.value.imageUrl })
  } catch (err) {
    console.error('Error updating image:', err)
    alert('Fehler beim Speichern des Bildes')
  }
}

onMounted(async () => {
  const recipeId = route.params.id as string
  let found = recipeStore.recipes.find(r => r.id === recipeId)
  if (!found) {
    await recipeStore.fetchRecipesOnce()
    found = recipeStore.recipes.find(r => r.id === recipeId)
  }
  if (found) {
    recipe.value = found
  }
})

const confirmDelete = async () => {
  if (!recipe.value?.id) return
  if (confirm('Möchtest du dieses Rezept wirklich löschen?')) {
    try {
      await recipeStore.deleteRecipe(recipe.value.id)
      router.push('/')
    } catch (err) {
      console.error('Delete error', err)
      alert('Fehler beim Löschen des Rezepts')
    }
  }
}

const toggleFavorite = async () => {
  if (!recipe.value?.id) return
  try {
    await recipeStore.toggleFavorite(recipe.value.id)
    if (recipe.value) {
      recipe.value.isFavorite = !recipe.value.isFavorite
    }
  } catch (err) {
    console.error('Error toggling favorite:', err)
  }
}

// Berechnet die Koch-Schritte basierend auf Zeilenumbrüchen
const steps = computed(() => {
  if (!recipe.value?.instructions) return []
  return recipe.value.instructions
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
})
</script>

<style scoped>
.recipe-detail {
  padding: 1rem;
}

.detail-container {
  max-width: 800px;
  margin: 0 auto;
  background: var(--card-background);
  padding: 2.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: var(--box-shadow);
}

.image-section {
  margin-bottom: 2rem;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.recipe-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 12px;
  object-fit: contain;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

h1 {
  margin: 0;
  flex: 1;
  color: var(--primary-color);
  font-size: 2rem;
  overflow-wrap: break-word;
  word-break: break-word;
  min-width: 0;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.file-input-hidden {
  display: none;
}

.camera-btn-detail {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  opacity: 0.5;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.camera-btn-detail:hover {
  opacity: 0.7;
}

.camera-icon-detail {
  width: 100%;
  height: 100%;
  filter: invert(26%) sepia(54%) saturate(730%) hue-rotate(221deg) brightness(99%) contrast(91%);
}

.favorite-btn-detail {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  opacity: 0.5;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.heart-icon-detail {
  width: 100%;
  height: 100%;
  filter: invert(26%) sepia(54%) saturate(730%) hue-rotate(221deg) brightness(99%) contrast(91%);
}

.favorite-btn-detail:hover .heart-icon-detail {
  filter: invert(26%) sepia(54%) saturate(730%) hue-rotate(221deg) brightness(108%) contrast(91%);
}

.favorite-btn-detail.is-favorite {
  opacity: 1;
}

.favorite-btn-detail.is-favorite .heart-icon-detail {
  filter: invert(26%) sepia(54%) saturate(730%) hue-rotate(221deg) brightness(99%) contrast(91%);
}

.section {
  margin: 2rem 0;
}

.section h2 {
  margin: 0 0 1rem 0;
  color: var(--secondary-color);
  font-size: 1.1rem;
  font-weight: 600;
}

.section p {
  color: var(--text-color);
  line-height: 1.6;
  white-space: pre-wrap;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.main-actions {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.main-actions .btn {
  flex: 1;
  text-align: center;
}

@media (min-width: 600px) {
  .actions {
    flex-direction: row;
    justify-content: flex-start;
  }

  .main-buttons {
    width: auto;
  }

  .btn-back {
    width: auto;
    margin-left: auto;
  }
}

@media (max-width: 400px) {
  .detail-container {
    padding: 1.5rem;
  }
  .btn-back {
    text-align: center;
  }
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.btn-edit {
  background: var(--primary-color);
  color: white;
}

.btn-edit:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-hover);
}

.btn-delete {
  background: #e0a0cc;
  color: white;
}

.btn-delete:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-hover);
}

.btn-back {
  background: var(--secondary-color);
  color: white;
}

.btn-back:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-hover);
}
</style>
