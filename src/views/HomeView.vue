<script setup lang="ts">
import RecipeList from '../components/RecipeList.vue'
</script>

<template>
  <header class="home-header">
    <h1>Rezept-App</h1>
    <p>Willkommen in der Rezept-App! Hier kannst du deine Lieblingsrezepte verwalten.</p>
  </header>

  <main>
    <h2>Rezeptliste</h2>
    <RecipeList />
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
</style>
