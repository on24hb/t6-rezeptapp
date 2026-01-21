<script setup lang="ts">
import { onMounted } from 'vue';
import { useRecipeStore } from '@/stores/recipeStore';

const store = useRecipeStore();

onMounted(() => {
  store.fetchRecipes();
});
</script>

<template>
  <div class="recipe-list">
    <h2>Meine Rezepte</h2>
    <div v-if="store.loading">Lädt...</div>
    <div v-for="recipe in store.recipes" :key="recipe.id" class="recipe-card">
      <h3>{{ recipe.title }}</h3>
      <p><strong>Zutaten:</strong> {{ recipe.ingredients }}</p>
      <p>{{ recipe.instructions }}</p>
    </div>
  </div>
</template>

<style scoped>
.recipe-card { border-bottom: 1px solid #eee; margin-bottom: 1rem; padding-bottom: 1rem; }
</style>
