<script setup lang="ts">
import { ref, computed } from 'vue'
import RecipeList from '../components/RecipeList.vue'
import { useRecipeStore } from '@/stores/recipeStore'
import { AVAILABLE_TAGS } from '@/tags'
import heartSolidFull from '@/assets/Icons/heart-solid-full.svg'

const store = useRecipeStore()
store.fetchRecipes()

const searchTerm = ref('')
const filterTag = ref('')
const filterFavorites = ref(false)

const filteredRecipes = computed(() => {
  return store.recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.value.toLowerCase())
    
    const matchesTag = filterTag.value ? recipe.tags?.includes(filterTag.value) : true
    
    const matchesFavorite = filterFavorites.value ? recipe.isFavorite : true
    
    return matchesSearch && matchesTag && matchesFavorite
  })
})
</script>

<template>
  <header class="home-header">
    <h1>Rezept-App</h1>
    <p>Willkommen in der Rezept-App! Hier kannst du deine Lieblingsrezepte verwalten.</p>
  <div class="search-bar">
      <input 
        v-model="searchTerm" 
        type="text" 
        placeholder="Suche nach Rezepten..." 
        class="search-input"
      />
      
      <select v-model="filterTag" class="filter-select">
        <option value="">Alle Kategorien</option>
        <option v-for="tag in AVAILABLE_TAGS" :key="tag" :value="tag">
          {{ tag }}
        </option>
      </select>

      <button 
        @click="filterFavorites = !filterFavorites"
        class="filter-btn"
        :class="{ active: filterFavorites }"
        :title="filterFavorites ? 'Zeige alle Rezepte' : 'Zeige nur Favoriten'"
      >
        <img 
          :src="heartSolidFull" 
          alt="Herz" 
          class="heart-icon-filter"
          :class="{ active: filterFavorites }"
        />
        Favoriten
      </button>
    </div>
  </header>

  <main>
    <h2>Rezeptliste</h2>
    <RecipeList :recipes="filteredRecipes" />
  </main>
</template>

<style scoped>
.home-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.home-header h1 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.home-header p {
  color: var(--text-light);
  margin: 0;
}

.separator {
  border: 0;
  border-top: 1px solid var(--border-color);
  margin: 3rem 0;
}

.form-section {
  margin-bottom: 2rem;
}

.search-bar {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.filter-select {
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
  min-width: 150px;
}

.filter-btn {
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.heart-icon-filter {
  width: 18px;
  height: 18px;
  filter: invert(30%) sepia(10%) saturate(50%) hue-rotate(265deg) brightness(100%) contrast(97%);
  transition: filter 0.2s ease;
}

.filter-btn:hover {
  border-color: var(--primary-color);
}

.filter-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.filter-btn.active .heart-icon-filter {
  filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(97%);
}
</style>
