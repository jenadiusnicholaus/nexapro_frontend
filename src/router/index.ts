import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import AuthLayout from '@/layouts/AuthLayout.vue'
import AppLayout from '@/layouts/AppLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'admin',
    component: AppLayout,
    meta: { requiresAuth: true },
    redirect: { name: 'dashboard' },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
      },
      {
        path: 'owners',
        name: 'owners',
        component: () => import('@/views/Owners.vue'),
      },
      {
        path: 'locations',
        name: 'locations',
        component: () => import('@/views/Locations.vue'),
      },
      {
        path: 'properties',
        name: 'properties',
        component: () => import('@/views/Properties.vue'),
      },
      {
        path: 'units',
        name: 'units',
        component: () => import('@/views/Units.vue'),
      },
      {
        path: 'tenants',
        name: 'tenants',
        component: () => import('@/views/Tenants.vue'),
      },
      {
        path: 'tenancies',
        name: 'tenancies',
        component: () => import('@/views/Tenancies.vue'),
      },
      {
        path: 'bills',
        name: 'bills',
        component: () => import('@/views/Bills.vue'),
      },
      {
        path: 'payments',
        name: 'payments',
        component: () => import('@/views/Payments.vue'),
      },
      {
        path: 'notifications',
        name: 'notifications',
        component: () => import('@/views/Notifications.vue'),
      },
      {
        path: 'profiles',
        name: 'profiles',
        component: () => import('@/views/Profiles.vue'),
      },
    ],
  },
  {
    path: '/auth',
    component: AuthLayout,
    meta: { requiresAuth: false },
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/Login.vue'),
      },
      {
        path: '',
        redirect: { name: 'login' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'dashboard' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' as const }
    return { top: 0 }
  },
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  authStore.initAuth()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.path.startsWith('/auth') && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
