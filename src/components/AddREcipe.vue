<script setup lang="ts">
import { ref } from 'vue';
import { useRecipeStore } from '@/stores/recipeStore';

const store = useRecipeStore();
const title = ref('');
const ingredients = ref('');
const instructions = ref('');

const submit = async () => {
  if (!title.value) return;
  await store.addRecipe({
    title: title.value,
    ingredients: ingredients.value,
    instructions: instructions.value,
    createdAt: new Date()
  });
  // Felder leeren
  title.value = '';
  ingredients.value = '';
  instructions.value = '';
};
</script>

<template>
  <div class="add-recipe">
    <h3>Neues Rezept</h3>
    <input v-model="title" placeholder="Titel" />
    <textarea v-model="ingredients" placeholder="Zutaten"></textarea>
    <textarea v-model="instructions" placeholder="Zubereitung"></textarea>
    <button @click="submit">Speichern</button>
  </div>
</template>

<style scoped>
.add-recipe { display: flex; flex-direction: column; gap: 10px; padding: 20px; border: 1px solid #ccc; }
input, textarea { padding: 8px; }
</style>