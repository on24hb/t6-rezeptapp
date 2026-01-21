<script setup lang="ts">
import { ref } from 'vue'
import { useRecipeStore } from '@/stores/recipeStore'

const store = useRecipeStore()
const title = ref('')
const ingredients = ref('')
const instructions = ref('')

const submit = async () => {
  if (!title.value) return
  await store.addRecipe({
    title: title.value,
    ingredients: ingredients.value,
    instructions: instructions.value,
    createdAt: new Date(),
  })
  // Felder leeren
  title.value = ''
  ingredients.value = ''
  instructions.value = ''
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

        <button class="save-button" type="submit">Speichern</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin-bottom: 2.5rem; /* Viel Abstand unter der Überschrift */
  color: var(--secondary-color);
}

.card {
  background: white;
  padding: 2.5rem; /* Mehr Innenabstand */
  border-radius: 12px;
  box-shadow: var(--box-shadow);
  border: 1px solid var(--border-color);
}

.form-group {
  margin-bottom: 2rem; /* Mehr Platz zwischen den Eingabefeldern */
}

label {
  display: block;
  margin-bottom: 0.75rem; /* Mehr Abstand zwischen Label und Input */
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-light);
}

input,
textarea {
  width: 100%;
  padding: 1rem;
  border: 1.5px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  background-color: #fafafa;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  background-color: #fff;
}

.save-button {
  width: 100%;
  padding: 0.8rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}
</style>
