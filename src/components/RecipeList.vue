<script setup lang="ts">
import { onMounted, watch, computed } from 'vue';
import { useRecipeStore } from '@/stores/recipeStore';
import type { Recipe } from '@/types/Recipe';
import RecipeTags from './RecipeTags.vue';
import { useAuthStore } from '@/stores/authStore';
import heartSolidFull from '@/assets/Icons/heart-solid-full.svg';
import heartRegularFull from '@/assets/Icons/heart-regular-full.svg';

const recipeStore = useRecipeStore();
const authStore = useAuthStore();

const props = defineProps<{
  recipes?: Recipe[]
}>();

// Watch the user's uid so the watcher fires reliably when auth state changes
watch(
  () => authStore.user?.uid,
  (uid) => {
    if (uid) {
      recipeStore.fetchRecipes();
    } else {
      recipeStore.clearRecipes();
    }
  },
  { immediate: true }
);

// If parent didn't provide recipes, ensure we fetch on mount when already signed in
onMounted(() => {
  if (!props.recipes && authStore.user?.uid) {
    recipeStore.fetchRecipes();
  }
});

const displayedRecipes = computed(() => props.recipes ?? recipeStore.recipes);

const toggleFavorite = async (e: Event, recipe: Recipe) => {
  e.preventDefault();
  e.stopPropagation();
  if (recipe.id) {
    await recipeStore.toggleFavorite(recipe.id);
  }
};
</script>

<template>
  <div class="list-wrapper">
    <!-- Show skeletons while auth or recipes are loading -->
    <div v-if="authStore.isLoading || (recipeStore.loading && displayedRecipes.length === 0)" class="skeleton-grid">
      <div v-for="n in 6" :key="n" class="skeleton-card">
        <div class="skeleton-title"></div>
        <div class="skeleton-line short"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-button"></div>
      </div>
    </div>

    <div v-else-if="authStore.user && displayedRecipes.length === 0" class="status-msg">
      Noch keine Rezepte vorhanden. Leg gleich eins an!
    </div>

    <div v-else-if="!authStore.user" class="status-msg">
      Bitte melde dich an, um deine Rezepte zu sehen.
    </div>

    <div v-else class="simple-grid">
      <router-link
        v-for="recipe in displayedRecipes"
        :key="recipe.id"
        :to="`/recipe/${recipe.id}`"
        class="recipe-card"
      >
        <div class="recipe-header">
          <h4>{{ recipe.title }}</h4>
          <button
            @click="toggleFavorite($event, recipe)"
            class="favorite-btn"
            :class="{ 'is-favorite': recipe.isFavorite }"
            :aria-label="recipe.isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'"
          >
            <img 
              :src="recipe.isFavorite ? heartSolidFull : heartRegularFull" 
              alt="Herz" 
              class="heart-icon"
            />
          </button>
        </div>
        <RecipeTags :tags="recipe.tags" />

        <p class="preview">{{ recipe.instructions }}</p>
        <button class="btn-link">Anzeigen →</button>
      </router-link>
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
  text-decoration: none;
  color: inherit;
}

.recipe-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--box-shadow-hover);
}

.recipe-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

h4 {
  margin: 0;
  color: var(--text-color);
  flex: 1;
}

.favorite-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  opacity: 0.5;
  transition: opacity 0.2s ease, filter 0.2s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.heart-icon {
  width: 100%;
  height: 100%;
  filter: invert(21%) sepia(51%) saturate(1344%) hue-rotate(265deg) brightness(101%) contrast(97%);
}

.favorite-btn:hover .heart-icon {
  filter: invert(21%) sepia(51%) saturate(1344%) hue-rotate(265deg) brightness(110%) contrast(97%);
}

.favorite-btn.is-favorite {
  opacity: 1;
}

.favorite-btn.is-favorite .heart-icon {
  filter: invert(21%) sepia(51%) saturate(1344%) hue-rotate(265deg) brightness(101%) contrast(97%);
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
