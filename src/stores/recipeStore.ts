import { defineStore } from 'pinia';
import { db } from '../../firebase';
import { 
  collection, 
  addDoc, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot, 
  query, 
  orderBy
} from 'firebase/firestore';
import type { Recipe } from '../types/Recipe';
import { ref } from 'vue';

export const useRecipeStore = defineStore('recipeStore', () => {
  const recipes = ref<Recipe[]>([]);
  const loading = ref(false);

  // Rezepte in Echtzeit laden
  const fetchRecipes = () => {
    loading.value = true;
    const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      recipes.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Recipe[];
      loading.value = false;
    });
  };

  // Neues Rezept hinzufügen
  const addRecipe = async (recipe: Omit<Recipe, 'id'>) => {
    try {
      await addDoc(collection(db, 'recipes'), {
        ...recipe,
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
  };
    // Bestehendes Rezept aktualisieren
    const updateRecipe = async (id: string, updates: any) => {
  try {
    const recipeRef = doc(db, 'recipes', id)
    await updateDoc(recipeRef, updates)
    // Update local state
    const index = recipes.value.findIndex(r => r.id === id)
    if (index !== -1) {
      recipes.value[index] = { ...recipes.value[index], ...updates }
    }
  } catch (error) {
    console.error('Error updating recipe:', error)
    throw error
  }
  };

  // Rezept löschen
  const deleteRecipe = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'recipes', id))
    recipes.value = recipes.value.filter(r => r.id !== id)
  } catch (error) {
    console.error('Error deleting recipe:', error)
    throw error
  }
};

  return { recipes, loading, fetchRecipes, addRecipe, updateRecipe, deleteRecipe };
})