<script setup lang="ts">
import { onMounted } from 'vue';
import { useRecipeStore } from '@/stores/recipeStore';

const store = useRecipeStore();

onMounted(() => {
  store.fetchRecipes();
});
</script>

<template>
  <div class="list-wrapper">
    <div v-if="store.loading">Rezepte werden geladen...</div>

    <div v-else class="simple-grid">
      <div v-for="recipe in store.recipes" :key="recipe.id" class="recipe-card">
        <h4>{{ recipe.title }}</h4>
        <p class="preview">{{ recipe.instructions }}</p>
        <button class="btn-link">Anzeigen →</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.simple-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.recipe-card {
  background: var(--card-background);
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: var(--box-shadow);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;
}

.recipe-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--box-shadow-hover);
}

h4 {
  margin: 0 0 0.75rem 0;
  color: var(--text-color);
}

.preview {
  font-size: 0.9rem;
  color: var(--text-light);
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 1.25rem;
  line-height: 1.4;
}

.btn-link {
  margin-top: auto;
  background: none;
  border: none;
  color: var(--primary-color);
  padding: 0;
  font-weight: 600;
  text-align: left;
}
</style>
