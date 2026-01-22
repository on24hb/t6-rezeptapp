import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AddRecipeView from '../views/AddRecipeView.vue'
import RecipeDetailView from '../views/RecipeDetailView.vue'
import EditRecipeView from '../views/EditRecipeView.vue'



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/add-recipe',
      name: 'add-recipe',
      component: AddRecipeView
    },
     {
      path: '/recipe/:id',
      name: 'recipe-detail',
      component: RecipeDetailView
    },
    {
      path: '/edit/:id',
      name: 'edit-recipe',
      component: EditRecipeView
    }
  ],
})

export default router
