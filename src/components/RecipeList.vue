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
    <!-- Show skeletons while auth or recipes are loading -->
    <div v-if="authStore.isLoading || (recipeStore.loading && recipeStore.recipes.length === 0)" class="skeleton-grid">
      <div v-for="n in 6" :key="n" class="skeleton-card">
        <div class="skeleton-title"></div>
        <div class="skeleton-line short"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-button"></div>
      </div>
    </div>

    <div v-else-if="authStore.user && recipeStore.recipes.length === 0" class="status-msg">
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


/* Skeleton styles */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.skeleton-card {
  background: linear-gradient(90deg, var(--card-background), #f6f7f8);
  border: 1px solid var(--border-color);
  padding: 1.25rem;
  border-radius: 10px;
  box-shadow: var(--box-shadow);
  min-height: 140px;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  overflow: hidden;
}

.skeleton-title,
.skeleton-line,
.skeleton-button {
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
  border-radius: 6px;
}

.skeleton-title {
  width: 70%;
  height: 18px;
}

.skeleton-line {
  height: 10px;
}

.skeleton-line.short {
  width: 50%;
}

.skeleton-button {
  margin-top: auto;
  width: 30%;
  height: 14px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

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
