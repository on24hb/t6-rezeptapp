<template>
  <div class="recipe-detail">
    <div v-if="recipe" class="detail-container">
      <h1>{{ recipe.title }}</h1>

      <div class="section">
        <h2>Zutaten</h2>
        <p>{{ recipe.ingredients }}</p>
      </div>

      <div class="section">
        <h2>Anleitung</h2>
        <p>{{ recipe.instructions }}</p>
      </div>

      <div class="actions">
        <router-link :to="`/edit/${recipe.id}`" class="btn btn-edit">Bearbeiten</router-link>
        <button @click="confirmDelete" class="btn btn-delete">Löschen</button>
        <router-link to="/" class="btn btn-back">Zurück</router-link>
      </div>
    </div>
    <div v-else>
      <p>Rezept nicht gefunden</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipeStore'
import type { Recipe } from '@/types/Recipe'

const route = useRoute()
const router = useRouter()
const recipeStore = useRecipeStore()
const recipe = ref<Recipe | null>(null)

onMounted(async () => {
  const recipeId = route.params.id as string
  let found = recipeStore.recipes.find(r => r.id === recipeId)
  if (!found) {
    // fallback: try a one-time fetch in case store wasn't populated
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
</script>

<style scoped>
.recipe-detail {
  padding: 20px;
}

.detail-container {
  max-width: 800px;
  margin: 0 auto;
}

.section {
  margin: 20px 0;
}

.section h2 {
  margin-bottom: 10px;
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

.btn-edit {
  background: #3857bd;
  color: white;
}

.btn-delete {
  background: #eb93e6;
  color: rgb(255, 255, 255);
}

.btn-back {
  background: #7cb9eb;
  color: white;
}
</style>
