import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AddRecipeView from '../views/AddRecipeView.vue'
import RecipeDetailView from '../views/RecipeDetailView.vue'
import EditRecipeView from '../views/EditRecipeView.vue'
import LoginView from '../views/LoginView.vue'
import SettingsView from '../views/SettingsView.vue'
import { auth } from '../../firebase'


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
// Use onAuthStateChanged but add a short timeout fallback to avoid blocking navigation
router.beforeEach((to, from, next) => {
  let handled = false;
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (handled) return;
    handled = true;
    unsubscribe();
    if (to.name !== 'login' && !user) {
      next({ name: 'login' });
    } else if (to.name === 'login' && user) {
      next({ name: 'home' });
    } else {
      next();
    }
  });

  // Fallback: if auth doesn't respond quickly (e.g. offline), proceed after short timeout
  setTimeout(() => {
    if (handled) return;
    handled = true;
    try { unsubscribe(); } catch {}
    const user = auth.currentUser;
    if (to.name !== 'login' && !user) {
      next({ name: 'login' });
    } else if (to.name === 'login' && user) {
      next({ name: 'home' });
    } else {
      next();
    }
  }, 150);
});
export default router
