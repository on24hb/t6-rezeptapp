import { defineStore } from 'pinia';
import { db, auth} from '../../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  type Unsubscribe,
  where
} from 'firebase/firestore';
import type { Recipe } from '../types/Recipe';
import { ref } from 'vue';

export const useRecipeStore = defineStore('recipeStore', () => {
  const recipes = ref<Recipe[]>([]);
  const loading = ref(false);

  // Variable zum Speichern der Abmelde-Funktion der Datenbank-Verbindung
  let unsubscribe: Unsubscribe | null = null;

  // Rezepte in Echtzeit laden
  const fetchRecipes = () => {
    // 1. Falls bereits eine Verbindung besteht, diese beenden
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }

    // 2. Sicherstellen, dass ein Nutzer eingeloggt ist
    if (!auth.currentUser) {
      recipes.value = [];
      return;
    }

    loading.value = true;

    // 3. Query erstellen: Nur Rezepte mit der aktuellen userId laden
    const q = query
    (collection(db, 'recipes'),
    where('userId', '==', auth.currentUser.uid),
    orderBy('createdAt', 'desc'));

    // Speichere die zurückgegebene Abmelde-Funktion, damit wir die Verbindung später beenden können
    unsubscribe = onSnapshot(q, (snapshot) => {
      recipes.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Recipe[];
      loading.value = false;
      },
      (error) => {
        console.error("Fehler beim Laden der Rezepte:", error);
        loading.value = false;
    });
  };

  // Neues Rezept hinzufügen
  const addRecipe = async (recipe: Omit<Recipe, 'id'>) => {
    if (!auth.currentUser) {
      console.error("Speichern fehlgeschlagen: Kein Nutzer angemeldet.");
      return;
    }

    try {
      await addDoc(collection(db, 'recipes'), {
        ...recipe,
        userId: auth.currentUser.uid,
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
  };

  // Funktion zum Aufräumen (z.B. beim Logout)
  const clearRecipes = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    recipes.value = [];
  };

  return { recipes, loading, fetchRecipes, addRecipe, clearRecipes };
});
