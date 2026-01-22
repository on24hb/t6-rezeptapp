import { defineStore } from 'pinia';
import { ref } from 'vue';
import { auth } from '../../firebase';
import {
  signInAnonymously, // Test ohne E-Mail
  onAuthStateChanged,
  signOut,
  type User
} from 'firebase/auth';

export const useAuthStore = defineStore('authStore', () => {
  const user = ref<User | null>(null);
  const isLoading = ref(true);

  // Status-Überwachung beim Start der App
  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser;
    isLoading.value = false;
  });

  // Test-Login (Anonym)
  async function loginAnonymously() {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Login fehlgeschlagen:", error);
    }
  }

  async function logout() {
    await signOut(auth);
  }

  return { user, isLoading, loginAnonymously, logout };
});
