<script setup lang="ts">
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { computed, ref } from 'vue'
import gearSolidFull from '@/assets/Icons/gear-solid-full.svg'
import { useOfflineStore } from '@/stores/offlineStore'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const isMenuOpen = ref(false)

const offlineStore = useOfflineStore()

const isNotLoginPage = computed(() => route.name !== 'login')

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
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
    <!--Offline Banner-->
    <div v-if="!offlineStore.isOnline" class="offline-banner">
      Du bist offline. Im Offline-Modus können keine Bilder hochgeladen werden.
    </div>
    <header class="app-bar" v-if="authStore.user && isNotLoginPage">
        <RouterLink to="/" class="brand" @click="closeMenu">
        <img src="/pwa-64x64.png" alt="Logo" class="logo" width="32" height="32" />
        <span class="app-title">Little Chef</span>
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

        <RouterLink to="/settings" class="settings-btn desktop-settings-btn" @click="closeMenu" title="Einstellungen">
          <img :src="gearSolidFull" alt="Einstellungen" class="settings-icon" />
        </RouterLink>


        <RouterLink to="/settings" class="nav-item mobile-settings-btn" @click="closeMenu" title="Einstellungen">
        <img :src="gearSolidFull" alt="Einstellungen" class="settings-icon" /> Einstellungen
        </RouterLink>
      </nav>
    </header>

    <main class="app-container">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.offline-banner {
  background-color: #c46111;
  color: white;
  padding: 12px;
  text-align: center;
  font-weight: 600;
  animation: slideDown 0.3s ease-out;
  position: sticky;
  top: 0;
  z-index: 99;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

.settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: var(--primary-color);
  transition: transform 0.2s ease, opacity 0.2s ease;
  text-decoration: none;
}

.desktop-settings-btn {
  display: flex;
}

.mobile-settings-btn {
  display: none;
}

.settings-icon {
  width: 24px;
  height: 24px;
  filter: invert(26%) sepia(54%) saturate(730%) hue-rotate(221deg) brightness(99%) contrast(91%);
}

.desktop-settings-btn {
  display: flex;
  padding: 0.5rem;
}

.settings-btn:hover {
  transform: rotate(30deg);
  opacity: 0.8;
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

  .desktop-settings-btn {
    display: none !important;
  }
  .mobile-settings-btn {
    display: flex !important;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    color: var(--text-dark);
    padding: 0.25rem 0.25rem;
    text-decoration: none;
  }

  .mobile-settings-btn .settings-icon,
  .nav-links .mobile-settings-btn .settings-icon {
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
    filter: invert(26%) sepia(54%) saturate(730%) hue-rotate(221deg) brightness(99%) contrast(91%);
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
