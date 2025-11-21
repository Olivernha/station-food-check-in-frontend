import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/MobileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/HistoryView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/views/UnauthorizedView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Skip auth checks for public routes
  if (to.path === '/login' || to.path === '/unauthorized') {
    return next()
  }

  // Wait for auth store to be ready if it's still loading
  if (authStore.isLoading) {
    // Wait a bit for auth to initialize
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Check authentication for protected routes
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  // Fetch user profile if needed
  if ((to.meta.requiresAdmin || to.path === '/') && !authStore.user && authStore.isAuthenticated) {
    try {
      await authStore.fetchUserProfile()
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      return next('/login')
    }
  }

  // Check admin access
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next('/unauthorized')
  }

  next()
})

export default router
