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
        <router-link :to="`/recipe/${recipe.id}`" class="btn btn-cancel">Abbrechen</router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipeStore'

const route = useRoute()
const router = useRouter()
const recipeStore = useRecipeStore()
const recipe = ref<any>(null)
const formData = ref<any>(null)

onMounted(() => {
  const recipeId = route.params.id as string
  recipe.value = recipeStore.recipes.find(r => r.id === recipeId)
  
  if (recipe.value) {
    formData.value = { ...recipe.value }
  }
})

const saveRecipe = async () => {
  try {
    await recipeStore.updateRecipe(recipe.value.id, formData.value)
    router.push(`/recipe/${recipe.value.id}`)
  } catch (error) {
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
  background: #4CAF50;
  color: white;
}

.btn-cancel {
  background: #999;
  color: white;
}
</style>