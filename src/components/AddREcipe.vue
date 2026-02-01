<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipeStore'
import { useTagsStore } from '@/stores/tagsStore'
import { compressImage } from '@/utils/imageUtils'
import { storage, auth } from '../../firebase'
import { ref as sRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

const emit = defineEmits(['saved'])
const router = useRouter()

const store = useRecipeStore()
const tagsStore = useTagsStore()
const fileInput = ref<HTMLInputElement | null>(null)

const title = ref('')
const ingredients = ref('')
const instructions = ref('')
const selectedTags = ref<string[]>([])
const imageUrl = ref<string | null>(null)
const isUploading = ref(false)
const validationError = ref('')

const DRAFT_KEY = 'recipe_create_draft'
const DEBOUNCE_DELAY = 1000

const createDebounce = (fn: () => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(fn, delay)
  }
}

const saveDraft = () => {
  const draftData: Record<string, unknown> = {
    title: title.value,
    ingredients: ingredients.value,
    instructions: instructions.value,
    selectedTags: selectedTags.value
  }
  // Only persist image URL if it's an actual uploaded (http) URL — not a transient blob URL
  if (imageUrl.value && imageUrl.value.startsWith('http')) {
    draftData.imageUrl = imageUrl.value
  }
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData))
}

const debouncedSave = createDebounce(saveDraft, DEBOUNCE_DELAY)

watch([title, ingredients, instructions, selectedTags, imageUrl], () => {
  debouncedSave()
}, { deep: true })

onMounted(() => {
  const savedDraft = localStorage.getItem(DRAFT_KEY)
  if (savedDraft) {
    try {
      const parsed = JSON.parse(savedDraft)
      if (parsed.title) title.value = parsed.title
      if (parsed.ingredients) ingredients.value = parsed.ingredients
      if (parsed.instructions) instructions.value = parsed.instructions
      if (parsed.selectedTags) selectedTags.value = parsed.selectedTags
      // nur laden, wenn es eine echte URL ist (kein blob URL) - sonst wird das Bild nicht angezeigt
      if (parsed.imageUrl && typeof parsed.imageUrl === 'string' && parsed.imageUrl.startsWith('http')) imageUrl.value = parsed.imageUrl
    } catch (e) {
      console.error('Fehler beim Laden des Entwurfs', e)
    }
  }
})

async function uploadImageFile(fileBlob: Blob, fileName: string) {
  if (!auth.currentUser) throw new Error('Nicht angemeldet')
  const path = `recipes/${auth.currentUser.uid}/${Date.now()}_${fileName.replace(/\.[^/.]+$/, "")}.jpg`
  const storageRef = sRef(storage, path)
  await uploadBytes(storageRef, fileBlob)
  return await getDownloadURL(storageRef)
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const originalFile = input.files[0]
    imageUrl.value = URL.createObjectURL(originalFile)

    try {
      if (!navigator.onLine) throw new Error('offline')
      isUploading.value = true

      console.log('Komprimiere Bild...')
      const compressedBlob = await compressImage(originalFile)

      console.log('Starte Upload...')
      const downloadUrl = await uploadImageFile(compressedBlob, originalFile.name)

      imageUrl.value = downloadUrl
    } catch (err) {
      console.error('Upload fehlgeschlagen:', err)
      alert('Fehler beim Hochladen: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'))
      imageUrl.value = null
    } finally {
      isUploading.value = false
      input.value = ''
    }
  }
}

const removeImage = async () => {
  if (!imageUrl.value) return
  const urlToDelete = imageUrl.value
  try {
    // wenn es eine Blob-URL ist, einfach widerrufen
    if (urlToDelete.startsWith('blob:')) {
      try { URL.revokeObjectURL(urlToDelete) } catch {}
    } else if (urlToDelete.startsWith('http')) {
      // Versuche, den Speicherpfad aus der Firebase-Download-URL zu extrahieren
      const match = urlToDelete.match(/\/o\/([^?]+)/)
      if (match && match[1]) {
        const storagePath = decodeURIComponent(match[1])
        const storageRef = sRef(storage, storagePath)
        await deleteObject(storageRef).catch((err) => console.warn('Konnte Bild nicht löschen:', err))
      } else {
        // Fallback: try using the full URL as ref
        const storageRef = sRef(storage, urlToDelete)
        await deleteObject(storageRef).catch((err) => console.warn('Konnte Bild nicht löschen (fallback):', err))
      }
    }
  } catch (err) {
    console.error('Löschen fehlgeschlagen:', err)
  }
  imageUrl.value = null
}

const submit = async () => {
  validationError.value = ''

  if (!title.value.trim()) {
    validationError.value = 'Bitte gib einen Rezeptnamen ein.'
    return
  }

  if (!ingredients.value.trim()) {
    validationError.value = 'Zutaten sind ein Pflichtfeld.'
    return
  }

  if (!instructions.value.trim()) {
    validationError.value = 'Anleitung ist ein Pflichtfeld.'
    return
  }

  if (isUploading.value) {
    alert('Bitte warte kurz, das Bild wird noch hochgeladen.')
    return
  }

  // verhindern, dass ein Blob-URL gespeichert wird (weil das Bild dann nicht mehr verfügbar ist)
  if (imageUrl.value && imageUrl.value.startsWith('blob:')) {
    alert('Bitte lade das Bild erneut hoch, bevor du das Rezept speicherst.')
    return
  }

  store.addRecipe({
    title: title.value,
    ingredients: ingredients.value,
    instructions: instructions.value,
    tags: selectedTags.value,
    imageUrl: imageUrl.value || undefined,
    createdAt: new Date(),
  })

  localStorage.removeItem(DRAFT_KEY)
  emit('saved')

  title.value = ''
  ingredients.value = ''
  instructions.value = ''
  selectedTags.value = []
  imageUrl.value = null
  validationError.value = ''
}

const handleCancel = () => {
  if(confirm('Möchtest du wirklich abbrechen?')) {
    localStorage.removeItem(DRAFT_KEY)
    router.push('/')
  }
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
              @change="handleImageUpload"
              class="file-input-hidden"
            />

            <div v-if="isUploading" class="upload-status">
              <p>Bild wird verarbeitet & hochgeladen...</p>
            </div>

            <div v-if="imageUrl && !isUploading" class="preview-container">
              <img :src="imageUrl" alt="Vorschau" class="image-preview" />
              <button type="button" @click="removeImage" class="remove-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="x-icon">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div v-else-if="!isUploading" class="camera-upload-prompt">
              <button type="button" @click="triggerFileInput" class="camera-icon-btn" title="Foto hinzufügen">
                <svg class="camera-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <path d="M213.1 128.8L202.7 160L128 160C92.7 160 64 188.7 64 224L64 480C64 515.3 92.7 544 128 544L512 544C547.3 544 576 515.3 576 480L576 224C576 188.7 547.3 160 512 160L437.3 160L426.9 128.8C420.4 109.2 402.1 96 381.4 96L258.6 96C237.9 96 219.6 109.2 213.1 128.8zM320 256C373 256 416 299 416 352C416 405 373 448 320 448C267 448 224 405 224 352C224 299 267 256 320 256z"/>
                </svg>
              </button>
              <p class="upload-text">Tippe hier für Foto oder Mediathek</p>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Zutaten</label>
          <textarea v-model="ingredients" rows="5" placeholder="Eier, Mehl, Zucker..."></textarea>
        </div>

        <div class="form-group">
         <div class="label-with-info">
            <label>Zubereitung</label>
            <div class="info-tooltip">
              <span class="info-icon">i</span>
              <span class="tooltip-text">Formuliere deine Anleitung in einzelnen Schritten, damit sie in der geführten Ansicht automatisch übernommen wird</span>
            </div>
          </div>
          <textarea
            v-model="instructions"
            rows="8"
            placeholder="Schritt 1: Zutaten schneiden
            Schritt 2: Zutaten in den Topf geben
            Schritt 3: Rühren"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Kategorien</label>
          <div class="tags-selection">
            <label v-for="tag in tagsStore.tags" :key="tag" class="checkbox-label">
              <input type="checkbox" :value="tag" v-model="selectedTags">
              {{ tag }}
            </label>
          </div>
        </div>

        <div v-if="validationError" class="error-message">
          {{ validationError }}
        </div>

        <div class="button-group">
          <button class="save-button" type="submit" :disabled="isUploading">
            {{ isUploading ? 'Bild lädt...' : 'Speichern' }}
          </button>
          <button class="cancel-button" type="button" @click="handleCancel">Abbrechen</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.upload-status {
  padding: 2rem;
  text-align: center;
  background: #f0f4ff;
  border-radius: 8px;
  color: #4868d1;
  font-weight: bold;
}
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

.label-with-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.75rem;
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
textarea::placeholder {
  white-space: pre-line;
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

.error-message {
  padding: 0.75rem;
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
  border-radius: 8px;
  font-weight: 500;
  margin-bottom: 1rem;
}

@media (hover: hover) {
  .checkbox-label:hover {
    border-color: #8873e6;
    background-color: #f8f7ff;
  }
}
</style>
