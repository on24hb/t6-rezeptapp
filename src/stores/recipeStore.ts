import { defineStore } from 'pinia';import { db, auth } from '../../firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  type Unsubscribe,
  where,
  serverTimestamp,
  Timestamp,
  type UpdateData,
  type DocumentData
} from 'firebase/firestore';
import type { Recipe } from '../types/Recipe';
import { ref } from 'vue';

// Helper type that matches stored Firestore shape
type FirestoreRecipe = {
  title: string;
  ingredients: string;
  instructions: string;
  createdAt: Timestamp | { seconds: number; nanoseconds: number } | Date | null;
  tags?: string[];
  userId?: string;
};

function isSecondsObject(obj: unknown): obj is { seconds: number } {
  return typeof obj === 'object' && obj !== null && 'seconds' in obj && typeof (obj as Record<string, unknown>).seconds === 'number';
}

function mapFirestoreDocToRecipe(id: string, data: FirestoreRecipe): Recipe {
  let createdAt: Date = new Date();
  if (!data.createdAt) {
    createdAt = new Date();
  } else if (data.createdAt instanceof Timestamp) {
    createdAt = data.createdAt.toDate();
  } else if (data.createdAt instanceof Date) {
    createdAt = data.createdAt as Date;
  } else if (isSecondsObject(data.createdAt)) {
    createdAt = new Date(data.createdAt.seconds * 1000);
  }

  return {
    id,
    title: data.title,
    ingredients: data.ingredients,
    instructions: data.instructions,
    createdAt,
    tags: data.tags || [],
    userId: data.userId
  };
}

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
    const q = query(
      collection(db, 'recipes'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    // Speichere die zurückgegebene Abmelde-Funktion, damit wir die Verbindung später beenden können
    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        recipes.value = snapshot.docs.map((d) => mapFirestoreDocToRecipe(d.id, d.data() as FirestoreRecipe));
        loading.value = false;
      },
      (error) => {
        console.error('Fehler beim Laden der Rezepte:', error);
        loading.value = false;
      }
    );
  };

  // Einmaliger Abruf (nützlich für Debug / fallback)
  const fetchRecipesOnce = async () => {
    if (!auth.currentUser) return;
    loading.value = true;
    const q = query(
      collection(db, 'recipes'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    try {
      const snap = await getDocs(q);
      recipes.value = snap.docs.map((d) => mapFirestoreDocToRecipe(d.id, d.data() as FirestoreRecipe));
    } catch (err) {
      console.error('Fehler beim einmaligen Abruf:', err);
    } finally {
      loading.value = false;
    }
  };

  // Neues Rezept hinzufügen
  const addRecipe = async (recipe: Omit<Recipe, 'id'> & { tags?: string[] }) => {
    if (!auth.currentUser) {
      console.error('Speichern fehlgeschlagen: Kein Nutzer angemeldet.');
      return;
    }

    try {
      await addDoc(collection(db, 'recipes'), {
        ...recipe,
        tags: recipe.tags || [],
        userId: auth.currentUser.uid,
        // Serverseitiger Timestamp verhindert Typ-Mischungen
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  // Bestehendes Rezept aktualisieren
  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    try {
      const recipeRef = doc(db, 'recipes', id);
      // Build a plain payload containing only defined fields
      const payload: Record<string, unknown> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.ingredients !== undefined) payload.ingredients = updates.ingredients;
      if (updates.instructions !== undefined) payload.instructions = updates.instructions;
      if (updates.createdAt !== undefined) payload.createdAt = updates.createdAt;
      if (updates.tags !== undefined) payload.tags = updates.tags;
      if (updates.userId !== undefined) payload.userId = updates.userId;

      // Cast once to the Firestore UpdateData type when calling the SDK
      await updateDoc(recipeRef, payload as UpdateData<DocumentData>);

      // Update local state
      const index = recipes.value.findIndex((r) => r.id === id);
      if (index !== -1) {
        const existing = recipes.value[index];
        const updated = { ...existing } as Recipe;
        if (updates.title !== undefined) updated.title = updates.title;
        if (updates.ingredients !== undefined) updated.ingredients = updates.ingredients!;
        if (updates.instructions !== undefined) updated.instructions = updates.instructions!;
        if (updates.createdAt !== undefined) updated.createdAt = updates.createdAt as Date;
        if (updates.tags !== undefined) updated.tags = updates.tags;
        if (updates.userId !== undefined) updated.userId = updates.userId;
        recipes.value[index] = updated;
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  };

  // Rezept löschen
  const deleteRecipe = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'recipes', id));
      recipes.value = recipes.value.filter((r) => r.id !== id);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
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

  return {
    recipes,
    loading,
    fetchRecipes,
    fetchRecipesOnce,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    clearRecipes
  };
});
