<script setup lang="ts">
import { watch } from 'vue';
import { useRecipeStore } from '@/stores/recipeStore';
import { useAuthStore } from '@/stores/authStore';

const recipeStore = useRecipeStore();
const authStore = useAuthStore();

// Watch the user's uid (primitive) so the watcher fires reliably when auth state changes
watch(
  () => authStore.user?.uid,
  (uid) => {
    if (uid) {
      console.log('Automatischer Daten-Fetch für UID:', uid);
      recipeStore.fetchRecipes();
    } else {
      recipeStore.clearRecipes();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="list-wrapper">
    <div v-if="authStore.user && recipeStore.recipes.length === 0" class="status-msg">
      Noch keine Rezepte vorhanden. Leg gleich eins an!
    </div>

    <div v-else-if="!authStore.user" class="status-msg">
      Bitte melde dich an, um deine Rezepte zu sehen.
    </div>

    <div v-else class="simple-grid">
      <div v-for="recipe in recipeStore.recipes" :key="recipe.id" class="recipe-card">
        <h4>{{ recipe.title }}</h4>
        <p class="preview">{{ recipe.instructions }}</p>
        <button class="btn-link">Anzeigen →</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

.status-msg {
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
}

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
