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
        <div class="main-actions">
        <router-link :to="`/edit/${recipe.id}`" class="btn btn-edit">Bearbeiten</router-link>
        <button @click="confirmDelete" class="btn btn-delete">Löschen</button>
        </div>
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

.title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

h1 {
  margin: 0;
  flex: 1;
  color: var(--primary-color);
  font-size: 2rem;
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
  filter: invert(26%) sepia(54%) saturate(730%) hue-rotate(221deg) brightness(99%) contrast(91%);
}

.favorite-btn-detail:hover .heart-icon-detail {
  filter: invert(26%) sepia(54%) saturate(730%) hue-rotate(221deg) brightness(108%) contrast(91%);
}

.favorite-btn-detail.is-favorite {
  opacity: 1;
}

.favorite-btn-detail.is-favorite .heart-icon-detail {
  filter: invert(26%) sepia(54%) saturate(730%) hue-rotate(221deg) brightness(99%) contrast(91%);
}

.section {
  margin: 2rem 0;
}

.section h2 {
  margin: 0 0 1rem 0;
  color: var(--secondary-color);
  font-size: 1.1rem;
  font-weight: 600;
}

.section p {
  color: var(--text-color);
  line-height: 1.6;
  white-space: pre-wrap;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.main-actions {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.main-actions .btn {
  flex: 1;
  text-align: center;
}

@media (min-width: 600px) {
  .actions {
    flex-direction: row;
    justify-content: flex-start;
  }

  .main-buttons {
    width: auto;
  }

  .btn-back {
    width: auto;
    margin-left: auto;
  }
}

@media (max-width: 400px) {
  .detail-container {
    padding: 1.5rem;
  }
  .btn-back {
    text-align: center;
  }
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.btn-edit {
  background: var(--primary-color);
  color: white;
}

.btn-edit:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-hover);
}

.btn-delete {
  background: #e0a0cc;
  color: white;
}

.btn-delete:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-hover);
}

.btn-back {
  background: var(--secondary-color);
  color: white;
}

.btn-back:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-hover);
}
</style>
