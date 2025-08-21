// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/MobileView.vue'),
    beforeEnter: async (_, __, next) => {
      const authStore = useAuthStore();
      const ok = await authStore.bootstrapAuth();
      next(ok ? true : '/login');
    },
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
    beforeEnter: async (_, __, next) => {
      const authStore = useAuthStore();
      const ok = await authStore.bootstrapAuth();
      if (!ok) return next('/login');

      const isAdmin = authStore.user?.jobTitle?.toLowerCase().includes('admin');
      next(isAdmin ? true : '/unauthorized');
    },
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/views/UnauthorizedView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
