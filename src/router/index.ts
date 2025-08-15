import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

// Mobile detection function
const isMobileDevice = (): boolean => {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768
  )
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      const authStore = useAuthStore()

      // Auto-login for demo purposes
      if (!authStore.isAuthenticated) {
        // Default to user login for mobile, admin for desktop
        if (isMobileDevice()) {
          return '/mobile'
        } else {
          return '/desktop'
        }
      }

      if (authStore.isAdmin) {
        return '/admin'
      }

      if (isMobileDevice()) {
        return '/mobile'
      }
      return '/desktop'
    },
  },
  {
    path: '/mobile',
    name: 'Mobile',
    component: () => import('../views/MobileView.vue'),
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
