import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AddRecipeView from '../views/AddRecipeView.vue'
import RecipeDetailView from '../views/RecipeDetailView.vue'
import EditRecipeView from '../views/EditRecipeView.vue'
import LoginView from '../views/LoginView.vue'
import SettingsView from '../views/SettingsView.vue'
import { auth, authReady } from '../../firebase'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
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
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    }
  ],
})

// Navigation Guard
// mit firebase authReady prüfen, ob der Nutzer authentifiziert ist, bevor er auf geschützte Routen zugreift
router.beforeEach(async (to, from, next) => {
  // Warten, bis der anfängliche Authentifizierungsstatus bekannt ist
  try {
    await authReady
  } catch {}
  const user = auth.currentUser
  if (to.name !== 'login' && !user) {
    next({ name: 'login' })
  } else if (to.name === 'login' && user) {
    next({ name: 'home' })
  } else {
    next()
  }
})
export default router
