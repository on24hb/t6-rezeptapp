import { defineStore } from 'pinia';
import { db, auth, storage } from '../../firebase';
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
  type DocumentData,
  deleteField
} from 'firebase/firestore';
import type { Recipe } from '../types/Recipe';
import { ref } from 'vue';
import { ref as sRef, deleteObject } from 'firebase/storage';

// Helper type that matches stored Firestore shape
type FirestoreRecipe = {
  title: string;
  ingredients: string;
  instructions: string;
  createdAt: Timestamp | { seconds: number; nanoseconds: number } | Date | null;
  tags?: string[];
  userId?: string;
  isFavorite?: boolean;
  imageUrl?: string;
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
    userId: data.userId,
    isFavorite: data.isFavorite || false,
    imageUrl: data.imageUrl
  };
}

export const useRecipeStore = defineStore('recipeStore', () => {
  const recipes = ref<Recipe[]>([]);
  const loading = ref(false);
  let unsubscribe: Unsubscribe | null = null;

  const fetchRecipes = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    if (!auth.currentUser) {
      recipes.value = [];
      return;
    }

    loading.value = true;
    const q = query(
      collection(db, 'recipes'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

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
        isFavorite: false,
        imageUrl: recipe.imageUrl || null,
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
      const payload: Record<string, unknown> = {};

      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.ingredients !== undefined) payload.ingredients = updates.ingredients;
      if (updates.instructions !== undefined) payload.instructions = updates.instructions;
      if (updates.createdAt !== undefined) payload.createdAt = updates.createdAt;
      if (updates.tags !== undefined) payload.tags = updates.tags;
      if (updates.userId !== undefined) payload.userId = updates.userId;
      if (updates.isFavorite !== undefined) payload.isFavorite = updates.isFavorite;
      // Handle imageUrl: if explicitly null -> delete field from Firestore
      if (updates.imageUrl === null) {
        payload.imageUrl = deleteField();
      } else if (updates.imageUrl !== undefined) {
        payload.imageUrl = updates.imageUrl;
      }

      await updateDoc(recipeRef, payload as UpdateData<DocumentData>);

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
        if (updates.isFavorite !== undefined) updated.isFavorite = updates.isFavorite;
        if (updates.imageUrl !== undefined) updated.imageUrl = updates.imageUrl;
        recipes.value[index] = updated;
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      // Zuerst das Bild aus dem Storage löschen, falls vorhanden
      const existing = recipes.value.find((r) => r.id === id);
      if (existing && existing.imageUrl && existing.imageUrl.startsWith('http')) {
        try {
          const downloadUrl = existing.imageUrl as string;
          // Extrahiere den Pfad aus der Download-URL. Download-URLs enthalten '/o/<encoded-path>?'
          const match = downloadUrl.match(/\/o\/([^?]+)/);
          if (match && match[1]) {
            const storagePath = decodeURIComponent(match[1]);
            const oldRef = sRef(storage, storagePath);
            await deleteObject(oldRef);
            console.log('Altes Bild im Storage gelöscht (Pfad)');
          } else {
            // Fallback: versuche, die URL direkt zu verwenden
            try {
              const oldRef = sRef(storage, downloadUrl);
              await deleteObject(oldRef);
              console.log('Altes Bild im Storage gelöscht (URL-Fallback)');
            } catch (innerErr) {
              console.warn('Konnte altes Bild im Storage nicht löschen (Fallback):', innerErr);
            }
          }
        } catch (err) {
          console.warn('Konnte altes Bild im Storage nicht löschen:', err);
          // Nicht kritisch, daher nur Warnung
        }
      }

      await deleteDoc(doc(db, 'recipes', id));
      recipes.value = recipes.value.filter((r) => r.id !== id);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  };

  const clearRecipes = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    recipes.value = [];
  };

  const toggleFavorite = async (id: string) => {
    const recipe = recipes.value.find((r) => r.id === id);
    if (!recipe) return;
    await updateRecipe(id, { isFavorite: !recipe.isFavorite });
  };

  // Beim Online-Gehen synchronisieren
  const syncOfflineChanges = async () => {
    if (navigator.onLine) {
      console.log('🔄 Syncing offline changes...')
      try {
        // Rezepte neu laden von Firebase
        await fetchRecipes()
        console.log('Sync erfolgreich')
      } catch (error) {
        console.error('Sync fehlgeschlagen:', error)
      }
    }
  }

  // Event Listener
  if (typeof window !== 'undefined') {
    window.addEventListener('online', syncOfflineChanges)
  }

  return {
    recipes,
    loading,
    fetchRecipes,
    fetchRecipesOnce,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    clearRecipes,
    toggleFavorite,
    syncOfflineChanges
  };
});
