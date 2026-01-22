<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
</script>

<template>
  <div class="app-layout">
    <header class="app-bar">
      <div class="brand">
        <img alt="Logo" class="logo" src="../logo.png" width="32" height="32" />
        <span class="app-title">RezeptBuddy</span>
      </div>
      <nav class="nav-links">

      <div class="auth-section">
          <template v-if="authStore.user">
            <span class="user-status">👤 {{ authStore.user.isAnonymous ? 'Gast-Nutzer' : authStore.user.email }}</span>
            <button @click="authStore.logout" class="btn-secondary">Abmelden</button>
          </template>
          <template v-else>
            <button @click="authStore.loginAnonymously" class="btn-login">Test-Login</button>
          </template>
        </div>

        <RouterLink to="/" class="nav-item">Meine Rezepte</RouterLink>
        <RouterLink to="/add-recipe" class="nav-item btn-add">＋ Neues Rezept</RouterLink>
      </nav>
    </header>

    <main class="app-container">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: var(--card-background);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--primary-color);
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-item {
  text-decoration: none;
  color: var(--text-light);
  font-size: 0.95rem;
  font-weight: 500;
}

.router-link-active:not(.btn-add) {
  color: var(--primary-color);
}

.btn-add {
  background-color: var(--primary-color);
  color: white !important;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
}

.auth-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-right: 1rem;
  padding-right: 1rem;
  border-right: 1px solid var(--border-color);
}

.user-status {
  font-size: 0.85rem;
  color: var(--text-light);
}

.btn-login {
  background: none;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-secondary {
  background: none;
  border: none;
  color: var(--danger-color);
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
}

.loading-overlay {
  text-align: center;
  padding: 3rem;
  color: var(--secondary-color);
}
</style>
