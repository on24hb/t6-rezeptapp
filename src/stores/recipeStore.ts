import { defineStore } from 'pinia';
import { db } from '../../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy,
  type DocumentData 
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

  return { recipes, loading, fetchRecipes, addRecipe };
});