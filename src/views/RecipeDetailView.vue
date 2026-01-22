<template>
  <div class="recipe-detail">
    <div v-if="recipe" class="detail-container">
      <div class="title-section">
        <h1>{{ recipe.title }}</h1>
        <button
          @click="toggleFavorite"
          class="favorite-btn-detail"
          :class="{ 'is-favorite': recipe.isFavorite }"
          :title="recipe.isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'"
        >
          <img 
            :src="recipe.isFavorite ? heartSolidFull : heartRegularFull" 
            alt="Herz" 
            class="heart-icon-detail"
          />
        </button>
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
import heartSolidFull from '@/assets/Icons/heart-solid-full.svg'
import heartRegularFull from '@/assets/Icons/heart-regular-full.svg'

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

const toggleFavorite = async () => {
  if (!recipe.value?.id) return
  
  try {
    await recipeStore.toggleFavorite(recipe.value.id)
    // Update local ref
    if (recipe.value) {
      recipe.value.isFavorite = !recipe.value.isFavorite
    }
  } catch (err) {
    console.error('Error toggling favorite:', err)
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

.title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
}

h1 {
  margin: 0;
  flex: 1;
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
  filter: invert(21%) sepia(51%) saturate(1344%) hue-rotate(265deg) brightness(101%) contrast(97%);
}

.favorite-btn-detail:hover .heart-icon-detail {
  filter: invert(21%) sepia(51%) saturate(1344%) hue-rotate(265deg) brightness(110%) contrast(97%);
}

.favorite-btn-detail.is-favorite {
  opacity: 1;
}

.favorite-btn-detail.is-favorite .heart-icon-detail {
  filter: invert(21%) sepia(51%) saturate(1344%) hue-rotate(265deg) brightness(101%) contrast(97%);
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
