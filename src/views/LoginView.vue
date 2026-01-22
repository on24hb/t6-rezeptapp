<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// Funktion für Google Login mit anschließender Weiterleitung
const handleGoogleLogin = async () => {
  await authStore.loginWithGoogle()
  // Wenn der Login erfolgreich war, ab zur Home-Seite
  if (authStore.user) {
    router.push('/')
  }
}

// Funktion für Gast-Login mit anschließender Weiterleitung
const handleGuestLogin = async () => {
  await authStore.loginAsGuest()
  if (authStore.user) {
    router.push('/')
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="logo-circle">
        <img src="../../logo.png" class="login-logo" alt="Logo" width="64" />
      </div>
      <h1>RezeptBuddy</h1>
      <p>Deine Rezepte, immer dabei.</p>

      <div class="actions">
        <button @click="handleGoogleLogin" class="btn-google-large">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" />
          Mit Google anmelden
        </button>

        <div class="divider"><span>oder</span></div>

        <button @click="handleGuestLogin" class="btn-guest">
          Als Gast fortfahren
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1 {
  margin-bottom: 0rem;
}
p {
  color: #666;
  margin-bottom: 2rem;
}

.login-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-card {
  background: white;
  padding: 3rem;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
}
.logo-circle {
  background: #fff;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}
.btn-google-large {
  width: 100%;
  padding: 0.8rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}
.btn-google-large:hover {
  background: #f9f9f9;
  transform: translateY(-1px);
}
.divider {
  margin: 1.5rem 0;
  position: relative;
  border-bottom: 1px solid #eee;
}
.divider span {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 0 10px;
  color: #999;
  font-size: 0.8rem;
}
.btn-guest {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
}
</style>
