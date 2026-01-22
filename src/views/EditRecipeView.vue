<template>
  <div class="edit-recipe">
    <h1>Rezept bearbeiten</h1>

    <form @submit.prevent="saveRecipe" v-if="formData">
      <div class="form-group">
        <label for="title">Rezeptname</label>
        <input v-model="formData.title" id="title" type="text" required>
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

const route = useRoute()
const router = useRouter()
const recipeStore = useRecipeStore()
// typed refs instead of any
const recipe = ref<Recipe | null>(null)
const formData = ref<Partial<Recipe> | null>(null)

const cancelUrl = computed(() => `/`)

onMounted(async () => {
  const recipeId = route.params.id as string
  // try to find in store
  let found = recipeStore.recipes.find((r) => r.id === recipeId)
  if (!found) {
    // try one-time fetch as fallback
    await recipeStore.fetchRecipesOnce()
    found = recipeStore.recipes.find((r) => r.id === recipeId)
  }

  if (found) {
    recipe.value = found
    // create a shallow copy for the form
    formData.value = { ...found }
  } else {
    // redirect if not found
    router.replace('/')
  }
})

const saveRecipe = async () => {
  if (!recipe.value || !formData.value || !recipe.value.id) return

  try {
    await recipeStore.updateRecipe(recipe.value.id, formData.value as Partial<Recipe>)
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
}

label {
  margin-bottom: 5px;
  font-weight: bold;
}

input, textarea {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

textarea {
  min-height: 150px;
  resize: vertical;
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
