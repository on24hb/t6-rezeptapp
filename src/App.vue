<script setup lang="ts">
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { computed, ref } from 'vue'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const isMenuOpen = ref(false)

const isNotLoginPage = computed(() => route.name !== 'login')

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

// Neues Logout-Verhalten: warte auf logout und navigiere dann zur Login-Seite
const handleLogout = async () => {
  const ok = await authStore.logout()
  closeMenu()
  if (ok) {
    router.push({ name: 'login' })
  }
}
</script>

<template>
  <div class="app-layout">
    <header class="app-bar" v-if="authStore.user && isNotLoginPage">
        <RouterLink to="/" class="brand" @click="closeMenu">
        <img src="/pwa-64x64.png" alt="Logo" class="logo" width="32" height="32" />
        <span class="app-title">RezeptBuddy</span>
      </RouterLink>

      <div class="navbar-right">
        <RouterLink to="/add-recipe" class="btn-add mobile-add-btn" @click="closeMenu">
          ＋ Neues Rezept
        </RouterLink>

      <button class="menu-toggle" @click="toggleMenu" :class="{ 'active': isMenuOpen }">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>
      </div>

      <nav class="nav-links" :class="{ 'is-open': isMenuOpen }">

      <div class="auth-section">
            <span class="user-status">
              <span class="user-icon">👤</span>
              {{ authStore.user?.isAnonymous ? 'Gast-Nutzer' : authStore.user?.email }}
            </span>
            <button @click="handleLogout" class="btn-secondary">Abmelden</button>
        </div>

        <RouterLink to="/add-recipe" class="nav-item btn-add desktop-add-btn" @click="closeMenu">
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
.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mobile-add-btn {
  display: none;
  text-decoration: none;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  background-color: var(--primary-color);
  color: white !important;
  border-radius: 6px;
}

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
  text-decoration: none;
  color: inherit;
  cursor: pointer;
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

  .app-title {
    display: none;
  }

  .desktop-add-btn {
    display: none !important;
  }
  .mobile-add-btn {
    display: flex;
  }

  .navbar-right {
    gap: 0.75rem;
  }

  .app-title {
    display: none;
  }

  .auth-section {
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    width: 100%;
    padding: 1.5rem 0;
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .user-status {
    font-size: 0.9rem;
    color: var(--text-dark);
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    word-break: break-all;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .btn-secondary {
    background-color: #fff1f1;
    color: var(--danger-color);
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    border: 1px solid #fee2e2;
    text-decoration: none;
    font-size: 0.8rem;
    width: auto;
    text-align: center;
    transition: background 0.2s;
  }

  .btn-secondary:active {
    background-color: #fee2e2;
  }
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
  background-color: #fff1f1;
  color: var(--danger-color);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #fee2e2;
  text-decoration: none;
  font-size: 0.8rem;
  width: auto;
  text-align: center;
  transition: background 0.2s;
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
