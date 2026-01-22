import { defineStore } from 'pinia';
import { ref } from 'vue';
import { auth } from '../../firebase';
import { useRecipeStore } from './recipeStore';
import {
  onAuthStateChanged,
  signOut,
  type User,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously
} from 'firebase/auth';

export const useAuthStore = defineStore('authStore', () => {
  const user = ref<User | null>(null);
  const isLoading = ref(true);

  // Status-Überwachung beim Start der App
  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser;
    isLoading.value = false;
  });

  // Gast-Login (Anonym)
  async function loginAsGuest() {
    try {
      const result = await signInAnonymously(auth);
      user.value = result.user ?? null;
      return user.value;
    } catch (error) {
      console.error("Gast-Login Fehler:", error)
      return null;
    }
  }

  // Google Login Funktion
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      user.value = result.user ?? null;
      console.log("Erfolgreich angemeldet:", result.user.displayName);
      return user.value;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Fehler beim Google Login:", error.message);
      }
      return null;
    }
  }

  async function logout() {
    const recipeStore = useRecipeStore();
    try {
      await signOut(auth);
      user.value = null;
      recipeStore.clearRecipes();
      return true;
    } catch (error: unknown) {
      console.error("Logout Fehler:", error);
      return false;
    }
  }

  return { user, isLoading, logout, loginWithGoogle, loginAsGuest };
});
