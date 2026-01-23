<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipeStore'
import { AVAILABLE_TAGS } from '@/tags'

const emit = defineEmits(['saved'])
const router = useRouter()

const store = useRecipeStore()
const title = ref('')
const ingredients = ref('')
const instructions = ref('')
const selectedTags = ref<string[]>([])

const submit = async () => {
  if (!title.value) return
  await store.addRecipe({
    title: title.value,
    ingredients: ingredients.value,
    instructions: instructions.value,
    tags: selectedTags.value,
    createdAt: new Date(),
  })

  emit('saved')

  // Felder leeren
  title.value = ''
  ingredients.value = ''
  instructions.value = ''
  selectedTags.value = []
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

input,
textarea {
  width: 100%;
  padding: 1rem;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  background-color: #fafafa;
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
