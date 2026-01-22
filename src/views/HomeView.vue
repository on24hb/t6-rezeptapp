<script setup lang="ts">
import { ref, computed } from 'vue'
import RecipeList from '../components/RecipeList.vue'
import { useRecipeStore } from '@/stores/recipeStore'
import { AVAILABLE_TAGS } from '@/tags'

const store = useRecipeStore()
store.fetchRecipes()

const searchTerm = ref('')
const filterTag = ref('')

const filteredRecipes = computed(() => {
  return store.recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.value.toLowerCase())
    
    const matchesTag = filterTag.value ? recipe.tags?.includes(filterTag.value) : true
    
    return matchesSearch && matchesTag
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
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.search-input {
  flex: 1;
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.filter-select {
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
}
</style>
