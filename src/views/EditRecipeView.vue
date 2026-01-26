<template>
  <div class="edit-recipe">
    <h1>Rezept bearbeiten</h1>

    <form @submit.prevent="saveRecipe" v-if="formData">
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
          capture="environment"
          @change="handleImageUpload"
          class="file-input-hidden"
        />
        <div v-if="formData && formData.imageUrl" class="preview-container">
          <img :src="formData.imageUrl" alt="Vorschau" class="image-preview" />
          <button type="button" @click="removeImage" class="remove-btn" title="Foto entfernen">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="x-icon">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div v-else class="camera-upload-prompt">
          <button type="button" @click="triggerFileInput" class="camera-icon-btn" title="Foto hinzufügen">
            <svg class="camera-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M213.1 128.8L202.7 160L128 160C92.7 160 64 188.7 64 224L64 480C64 515.3 92.7 544 128 544L512 544C547.3 544 576 515.3 576 480L576 224C576 188.7 547.3 160 512 160L437.3 160L426.9 128.8C420.4 109.2 402.1 96 381.4 96L258.6 96C237.9 96 219.6 109.2 213.1 128.8zM320 256C373 256 416 299 416 352C416 405 373 448 320 448C267 448 224 405 224 352C224 299 267 256 320 256z"/>
            </svg>
          </button>
          <p class="upload-text">Klicke auf das Kamera-Icon um ein Foto hinzuzufügen</p>
        </div>
      </div>

      <div class="form-group">
        <label for="ingredients">Zutaten</label>
        <textarea v-model="formData.ingredients" id="ingredients" required></textarea>
      </div>

      <div class="form-group">
        <label for="instructions">Anleitung</label>
        <textarea v-model="formData.instructions" id="instructions" required></textarea>
      </div>

      <div class="actions">
        <button type="submit" class="btn btn-save">Speichern</button>
        <router-link :to="cancelUrl" class="btn btn-cancel">Abbrechen</router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipeStore'
import type { Recipe } from '@/types/Recipe'
import { storage, auth } from '../../firebase'
import { ref as sRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

const route = useRoute()
const router = useRouter()
const recipeStore = useRecipeStore()

type FormRecipe = Partial<Recipe> & { imageUrl?: string | null }
const recipe = ref<Recipe | null>(null)
const formData = ref<FormRecipe | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

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

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0] && formData.value) {
    const file = input.files[0]

    // Sofort lokale Vorschau
    formData.value.imageUrl = URL.createObjectURL(file)

    // Upload zum Firebase Storage
    try {
      if (!auth.currentUser) throw new Error('Nicht angemeldet')
      if (!navigator.onLine) throw new Error('offline')
      const path = `recipes/${auth.currentUser.uid}/${Date.now()}_${file.name}`
      const storageRef = sRef(storage, path)
      await uploadBytes(storageRef, file)
      const downloadUrl = await getDownloadURL(storageRef)
      if (formData.value) formData.value.imageUrl = downloadUrl
    } catch (err) {
      console.error('Upload fehlgeschlagen:', err)
      alert('Fehler beim Hochladen des Bildes')
    }
  }
}

const removeImage = () => {
  if (!formData.value) return

  if (!confirm('Möchtest du das Bild wirklich entfernen?')) {
    return
  }

  // Lokale Blob-URL widerrufen, falls vorhanden
  try {
    const url = formData.value.imageUrl
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  } catch {
    // Ignorieren
  }

  // Setze imageUrl auf null, um das Bild zu entfernen
  formData.value = ({ ...formData.value, imageUrl: null } as FormRecipe)
}

const saveRecipe = async () => {
  if (!recipe.value || !formData.value || !recipe.value.id) return

  try {
    // Wenn der Nutzer das Bild entfernt hat, Datei auch aus dem Firebase Storage löschen
    if (formData.value.imageUrl === null && recipe.value.imageUrl && recipe.value.imageUrl.startsWith('http')) {
      try {
        const downloadUrl = recipe.value.imageUrl as string
        // Extrahiere den Pfad aus der Download-URL. Download-URLs enthalten '/o/<encoded-path>?'
        const match = downloadUrl.match(/\/o\/([^?]+)/)
        if (match && match[1]) {
          const storagePath = decodeURIComponent(match[1])
          const oldRef = sRef(storage, storagePath)
          await deleteObject(oldRef)
          console.log('Altes Bild im Storage gelöscht (Pfad)')
        } else {
          // Fallback: Versuche, die URL direkt zu verwenden
          try {
            const oldRef = sRef(storage, downloadUrl)
            await deleteObject(oldRef)
            console.log('Altes Bild im Storage gelöscht (URL-Fallback)')
          } catch (innerErr) {
            console.warn('Konnte altes Bild im Storage nicht löschen (Fallback):', innerErr)
          }
        }
      } catch (err) {
        console.warn('Konnte altes Bild im Storage nicht löschen:', err)
        // Nicht kritisch, daher nur Warnung
      }
    }

    // Behalte den Wert von imageUrl bei (kann string, undefined oder null sein).
    // Der Store behandelt `null` als Anfrage, das Feld in Firestore zu löschen.
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
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin: 15px 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
h1 {
  overflow-wrap: break-word; 
  word-break: break-word;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
}

input[type="text"], textarea {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

textarea {
  min-height: 150px;
  resize: vertical;
}

.file-input-hidden {
  display: none;
}


.camera-upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  border: 2px dashed #4868d1;
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
  color: #4868d1;
  fill: #4868d1;
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
  display: block;

}.image-preview {
  width: 100%;
  height: 300px;
  border-radius: 4px;
  border: 1px solid #ddd;
  object-fit: cover;
  display: block;
  
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
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

.actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-save {
  background: #424cb8;
  color: white;
}

.btn-cancel {
  background: #999;
  color: white;
}
</style>
