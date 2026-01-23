<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipeStore'
import { AVAILABLE_TAGS } from '@/tags'
import { storage, auth } from '../../firebase'
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const emit = defineEmits(['saved'])
const router = useRouter()

const store = useRecipeStore()
const fileInput = ref<HTMLInputElement | null>(null)
const title = ref('')
const ingredients = ref('')
const instructions = ref('')
const selectedTags = ref<string[]>([])
const imageUrl = ref<string | null>(null)
const isUploading = ref(false)

async function uploadImageFile(file: File) {
  if (!auth.currentUser) throw new Error('Nicht angemeldet')
  const path = `recipes/${auth.currentUser.uid}/${Date.now()}_${file.name}`
  const storageRef = sRef(storage, path)
  await uploadBytes(storageRef, file)
  return await getDownloadURL(storageRef)
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    // Sofort eine lokale Vorschau anzeigen
    imageUrl.value = URL.createObjectURL(file)

    // Upload in Storage starten
    try {
      if (!navigator.onLine) throw new Error('offline')
      isUploading.value = true
      const downloadUrl = await uploadImageFile(file)
      imageUrl.value = downloadUrl
    } catch (err) {
      console.error('Upload fehlgeschlagen:', err)
      alert('Fehler beim Hochladen des Bildes')
    } finally {
      isUploading.value = false
    }
  }
}

const removeImage = () => {
  imageUrl.value = null
}

const submit = async () => {
  if (!navigator.onLine) {
    alert('Du bist offline - Neue Rezepte können nicht gespeichert werden. Versuche es später erneut.')
    return
  }

  if (!title.value) return
  await store.addRecipe({
    title: title.value,
    ingredients: ingredients.value,
    instructions: instructions.value,
    tags: selectedTags.value,
    imageUrl: imageUrl.value || undefined,
    createdAt: new Date(),
  })

  emit('saved')

  // Felder leeren
  title.value = ''
  ingredients.value = ''
  instructions.value = ''
  selectedTags.value = []
  imageUrl.value = null
}

const handleCancel = () => {
  router.push('/')
}
</script>

<template>
  <div class="form-container">
    <div class="card">
      <form @submit.prevent="submit">
        <div class="form-group">
          <label>Titel</label>
          <input v-model="title" type="text" placeholder="z.B. Omas Apfelkuchen" required />
        </div>

        <div class="form-group">
          <label>Rezeptfoto</label>
          <div class="image-upload-container">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              capture="environment"
              @change="handleImageUpload"
              class="file-input-hidden"
            />

            <div v-if="imageUrl" class="preview-container">
              <img :src="imageUrl" alt="Vorschau" class="image-preview" />
              <button type="button" @click="removeImage" class="remove-btn">Foto entfernen</button>
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
        </div>

        <div class="form-group">
          <label>Zutaten</label>
          <textarea v-model="ingredients" rows="5" placeholder="Eier, Mehl, Zucker..."></textarea>
        </div>

        <div class="form-group">
          <label>Zubereitung</label>
          <textarea
            v-model="instructions"
            rows="8"
            placeholder="Schritt für Schritt Anleitung..."
          ></textarea>
        </div>

        <div class="form-group">
          <label>Kategorien</label>
          <div class="tags-selection">
            <label v-for="tag in AVAILABLE_TAGS" :key="tag" class="checkbox-label">
              <input type="checkbox" :value="tag" v-model="selectedTags">
              {{ tag }}
            </label>
          </div>
        </div>

        <div class="button-group">
          <button class="save-button" type="submit">Speichern</button>
          <button class="cancel-button" type="button" @click="handleCancel">Abbrechen</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin-bottom: 2.5rem;
  color: #333;
}

.card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
}

.form-group {
  margin-bottom: 2rem;
}

label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: #666;
}

input[type="text"],
textarea {
  width: 100%;
  padding: 1rem;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  background-color: #fafafa;
}

.file-input-hidden {
  display: none;
}

.image-upload-container {
  position: relative;
}

.camera-upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  border: 2px dashed #8873e6;
  border-radius: 8px;
  background-color: #f9f7ff;
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
  color: #8873e6;
}

.upload-text {
  color: #666;
  font-size: 0.9rem;
  text-align: center;
  margin: 0;
}

.preview-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-preview {
  max-width: 100%;
  height: auto;
  max-height: 300px;
  border-radius: 8px;
  border: 1px solid #ddd;
  object-fit: contain;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.remove-btn {
  margin-top: 0.75rem;
  background-color: #ff5252;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.remove-btn:hover {
  background-color: #ff3838;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #4CAF50;
  background-color: #fff;
}

form {
  display: flex;
  flex-direction: column;
}

.save-button,
.cancel-button {
  padding: 0.8rem;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  flex: 1;
}

.save-button {
  background-color: #8873e6;
  margin-right: 0.5rem;
  margin-top: 1rem;
}

.save-button:hover {
  background-color: #7e6ad6;
}

.cancel-button {
  background-color: #4868d1;
  margin-top: 1rem;
}

.cancel-button:hover {
  background-color: #405cb8;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.tags-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  width: 100%;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: normal;
  padding: 0.6rem 1rem;
  background-color: #f0f0f0;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  justify-content: center;
  flex: 1 0 auto;
  min-width: 80px;
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
</style>
