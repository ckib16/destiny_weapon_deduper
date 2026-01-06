import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import WeaponsView from '@/views/WeaponsView.vue'
import CallbackView from '@/views/CallbackView.vue'
import WeaponDetailView from '@/views/WeaponDetailView.vue'
import PlaygroundView from '@/views/PlaygroundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'weapons',
      component: WeaponsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/about',
      name: 'about',
      component: HomeView
    },
    {
      path: '/weapons/:weaponHash',
      name: 'weapon-detail',
      component: WeaponDetailView,
      meta: { requiresAuth: true }
    },
    {
      path: '/playground/:weaponHash?',
      name: 'playground',
      component: PlaygroundView
    },
    {
      path: '/callback',
      name: 'callback',
      component: CallbackView
    }
  ]
})

// Navigation guard for protected routes
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'about' })
  } else {
    next()
  }
})

export default router
