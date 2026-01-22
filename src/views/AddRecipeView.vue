<script setup lang="ts">
import AddRecipe from '../components/AddREcipe.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Optional: Nach dem Speichern automatisch zur Liste zurückkehren
const handleSaved = () => {
  router.push('/')
}
</script>

<template>
  <main>
    <h2>Neues Rezept erstellen</h2>
    <AddRecipe @saved="handleSaved" />
  </main>
</template>

