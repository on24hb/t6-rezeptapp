<template>
  <div class="edit-recipe">
    <div class="detail-container" v-if="formData">
      <h1>Rezept bearbeiten</h1>

      <form @submit.prevent="saveRecipe">
      <div class="form-group">
        <label for="title">Rezeptname</label>
        <input v-model="formData.title" id="title" type="text" required>
      </div>

      <div class="form-group">
        <label>Rezeptfoto</label>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleImageUpload"
          class="file-input-hidden"
        />
        
        <div v-if="isUploading" style="padding: 1rem; background: #f0f4ff; text-align: center; border-radius: 4px; margin-bottom: 1rem;">
          Bild wird verarbeitet & hochgeladen...
        </div>

        <div v-if="formData && formData.imageUrl && !isUploading" class="preview-container">
          <img :src="formData.imageUrl" alt="Vorschau" class="image-preview" />
          <button type="button" @click="removeImage" class="remove-btn" title="Foto entfernen">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="x-icon">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div v-else-if="!isUploading" class="camera-upload-prompt">
          <button type="button" @click="triggerFileInput" class="camera-icon-btn" title="Foto hinzufügen">
             <svg class="camera-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M213.1 128.8L202.7 160L128 160C92.7 160 64 188.7 64 224L64 480C64 515.3 92.7 544 128 544L512 544C547.3 544 576 515.3 576 480L576 224C576 188.7 547.3 160 512 160L437.3 160L426.9 128.8C420.4 109.2 402.1 96 381.4 96L258.6 96C237.9 96 219.6 109.2 213.1 128.8zM320 256C373 256 416 299 416 352C416 405 373 448 320 448C267 448 224 405 224 352C224 299 267 256 320 256z"/></svg>
          </button>
          <p class="upload-text">Foto hinzufügen</p>
        </div>
      </div>

      <div class="form-group">
        <label for="ingredients">Zutaten</label>
        <textarea v-model="formData.ingredients" id="ingredients" required></textarea>
      </div>
      <div class="form-group">
        
      <div class="label-with-info">
          <label for="instructions">Anleitung</label>
          <div class="info-tooltip">
            <span class="info-icon">i</span>
            <span class="tooltip-text">Formuliere deine Anleitung in einzelnen Schritten, damit sie in der geführten Ansicht automatisch übernommen wird</span>
          </div>
        </div>
         <textarea v-model="formData.instructions" id="instructions" required></textarea>
      </div>

      <div class="form-group">
        <label>Kategorien</label>
        <div class="tags-selection">
          <label v-for="tag in tagsStore.tags" :key="tag" class="checkbox-label">
            <input type="checkbox" :value="tag" v-model="formData.tags">
            {{ tag }}
          </label>
        </div>
      </div>

      <div v-if="validationError" class="error-message">
        {{ validationError }}
      </div>

      <div class="actions">
        <button type="submit" class="btn btn-save" :disabled="isUploading">
          {{ isUploading ? 'Bild lädt...' : 'Speichern' }}
        </button>
        <router-link :to="cancelUrl" class="btn btn-cancel">Abbrechen</router-link>
      </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipeStore'
import { useTagsStore } from '@/stores/tagsStore'
import type { Recipe } from '@/types/Recipe'
import { storage, auth } from '../../firebase'
import { ref as sRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

const route = useRoute()
const router = useRouter()
const recipeStore = useRecipeStore()
const tagsStore = useTagsStore()

type FormRecipe = Partial<Recipe> & { imageUrl?: string | null }
const recipe = ref<Recipe | null>(null)
const formData = ref<FormRecipe | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const validationError = ref('')

const cancelUrl = computed(() => `/`)

const triggerFileInput = () => {
  fileInput.value?.click()
}

onMounted(async () => {
  const recipeId = route.params.id as string
  let found = recipeStore.recipes.find((r) => r.id === recipeId)
  if (!found) {
    await recipeStore.fetchRecipesOnce()
    found = recipeStore.recipes.find((r) => r.id === recipeId)
  }

  if (found) {
    recipe.value = found
    formData.value = { ...found }
  } else {
    router.replace('/')
  }
})

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
          else reject(new Error('Bild konnte nicht verarbeitet werden'))
        }, 'image/jpeg', quality)
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}

async function uploadImageFile(fileBlob: Blob, fileName: string) {
  if (!auth.currentUser) throw new Error('Nicht angemeldet')
  const path = `recipes/${auth.currentUser.uid}/${Date.now()}_${fileName.replace(/\.[^/.]+$/, "")}.jpg`
  const storageRef = sRef(storage, path)
  await uploadBytes(storageRef, fileBlob)
  return await getDownloadURL(storageRef)
}

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0] && formData.value) {
    const originalFile = input.files[0]

    formData.value.imageUrl = URL.createObjectURL(originalFile)

    try {
      if (!auth.currentUser) throw new Error('Nicht angemeldet')
      if (!navigator.onLine) throw new Error('offline')
      
      isUploading.value = true

      const compressedBlob = await compressImage(originalFile)

      const downloadUrl = await uploadImageFile(compressedBlob, originalFile.name)
      
      if (formData.value) formData.value.imageUrl = downloadUrl
      
    } catch (err) {
      console.error('Upload fehlgeschlagen:', err)
      alert('Fehler beim Hochladen des Bildes')
    } finally {
      isUploading.value = false
    }
  }
}

const removeImage = () => {
  if (!formData.value) return

  if (!confirm('Möchtest du das Bild wirklich entfernen?')) {
    return
  }
  try {
    const url = formData.value.imageUrl
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  } catch {}

  formData.value = ({ ...formData.value, imageUrl: null } as FormRecipe)
}

const saveRecipe = async () => {
  validationError.value = ''

  if (!recipe.value || !formData.value || !recipe.value.id) return
  
  if (!formData.value.ingredients?.trim()) {
    validationError.value = 'Zutaten sind ein Pflichtfeld.'
    return
  }

  if (!formData.value.instructions?.trim()) {
    validationError.value = 'Anleitung ist ein Pflichtfeld.'
    return
  }

  if (isUploading.value) {
    alert('Bitte warte, bis das Bild hochgeladen ist.')
    return
  }

  try {
    if (formData.value.imageUrl === null && recipe.value.imageUrl && recipe.value.imageUrl.startsWith('http')) {
       try {
        const downloadUrl = recipe.value.imageUrl as string
        const match = downloadUrl.match(/\/o\/([^?]+)/)
        if (match && match[1]) {
          const storagePath = decodeURIComponent(match[1])
          const oldRef = sRef(storage, storagePath)
          await deleteObject(oldRef)
        }
      } catch (e) { console.warn(e) }
    }

    const updateData = { ...formData.value } as unknown as Partial<Recipe>
    await recipeStore.updateRecipe(recipe.value.id, updateData)
    router.push(`/recipe/${recipe.value.id}`)
  } catch (err) {
    console.error('Save error', err)
    alert('Fehler beim Speichern des Rezepts')
  }
}
</script>

<style scoped>
.edit-recipe {
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

h1 {
  margin: 0 0 2rem 0;
  color: var(--primary-color);
  font-size: 1.8rem;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.95rem;
}

input[type="text"],
textarea {
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: inherit;
  font-size: 1rem;
  background-color: #fafafa;
}

input[type="text"]:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  background-color: white;
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.label-with-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}
.label-with-info label {
  margin-bottom: 0;
}
.info-tooltip {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: help;
}
.info-icon {
  width: 18px;
  height: 18px;
  background: #999;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: italic;
}
.tooltip-text {
  visibility: hidden;
  width: 200px;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 8px;
  position: absolute;
  z-index: 100;
  bottom: 125%;
  left: 50%;
  margin-left: -100px;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.8rem;
  font-weight: normal;
  line-height: 1.4;
  pointer-events: none;
}
.tooltip-text::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #333 transparent transparent transparent;
}
.info-tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

.file-input-hidden {
  display: none;
}

.camera-upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  border: 2px dashed var(--primary-color);
  border-radius: 8px;
  background-color: #f0f4ff;
}

.camera-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  transition: transform 0.2s ease, opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.camera-icon-btn:hover {
  transform: scale(1.1);
  opacity: 0.8;
}

.camera-icon {
  width: 3rem;
  height: 3rem;
  color: var(--primary-color);
  fill: var(--primary-color);
}

.upload-text {
  color: #666;
  font-size: 0.9rem;
  text-align: center;
  margin: 0;
}

.preview-container {
  margin-top: 1rem;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-preview {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  object-fit: contain;
}

.remove-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #da6834;
  color: white;
  border: 2px solid white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  padding: 0;
  transition: transform 0.2s ease, background-color 0.2s ease;
  z-index: 10;
}

.remove-btn:hover {
  transform: scale(1.1);
  background: #f37f49;
}

.x-icon {
  width: 18px;
  height: 18px;
}

.tags-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.6rem 1rem;
  background-color: #f0f0f0;
  border: 1.5px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  flex: 1 0 auto;
  min-width: 80px;
  justify-content: center;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkbox-label:has(input:checked) {
  background-color: #8873e6;
  border-color: #8873e6;
  color: white;
  box-shadow: 0 2px 4px rgba(136, 115, 230, 0.3);
}

@media (hover: hover) {
  .checkbox-label:hover {
    border-color: #8873e6;
    background-color: #f8f7ff;
  }
}

.error-message {
  padding: 0.75rem;
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
  border-radius: 8px;
  font-weight: 500;
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn {
  flex: 1;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-save {
  background: var(--primary-color);
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #3d5aa8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: #999;
  color: white;
}

.btn-cancel:hover {
  background: #888;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
</style>
