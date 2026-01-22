<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ref } from 'vue'

const authStore = useAuthStore()
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <div class="app-layout">
    <header class="app-bar">
      <div class="brand">
        <img alt="Logo" class="logo" src="../logo.png" width="32" height="32" />
        <span class="app-title">RezeptBuddy</span>
      </div>

      <button class="menu-toggle" @click="toggleMenu" :class="{ 'active': isMenuOpen }">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>

      <nav class="nav-links" :class="{ 'is-open': isMenuOpen }">

      <div class="auth-section">
            <span class="user-status">
              👤 {{ authStore.user?.isAnonymous ? 'Gast-Nutzer' : authStore.user?.email }}
            </span>
            <button @click="() => {authStore.logout(); closeMenu(); }" class="btn-secondary">Abmelden</button>
        </div>

        <RouterLink to="/add-recipe" class="nav-item btn-add" @click="closeMenu">
          ＋ Neues Rezept
        </RouterLink>
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
  padding-right: 1.5rem;
  border-right: 1px solid var(--border-color);
}

.user-status {
  font-size: 0.85rem;
  color: var(--text-light);
}

/* Burger Menu Styles */
.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
}

.bar {
  width: 25px;
  height: 3px;
  background-color: var(--primary-color);
  transition: 0.3s;
}

@media (max-width: 768px) {
  .menu-toggle { display: flex; z-index: 1001; }
  .menu-toggle.active .bar:nth-child(1) { transform: translateY(8px) rotate(45deg); }
  .menu-toggle.active .bar:nth-child(2) { opacity: 0; }
  .menu-toggle.active .bar:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }

  .nav-links {
    position: fixed; top: 0; right: -100%; width: 260px; height: 100vh;
    background-color: white; flex-direction: column; padding: 5rem 1.5rem;
    transition: 0.3s; box-shadow: -5px 0 15px rgba(0,0,0,0.1); align-items: flex-start;
  }
  .nav-links.is-open { right: 0; }
  .auth-section { border-right: none; border-bottom: 1px solid var(--border-color); width: 100%; padding-bottom: 1rem; flex-direction: column; align-items: flex-start; }
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

.btn-google {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: white;
  color: #757575;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-google:hover {
  background-color: #f8f8f8;
}
</style>
