import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
      path: '/customers',
      name: 'customers',
      component: () => import('../views/CustomersView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
      path: '/deposito-settings',
      name: 'deposito-settings',
      component: () => import('../views/DepositoSettingsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
      path: '/customer-portal',
      name: 'customer-portal',
      component: () => import('../views/CustomerPortalView.vue'),
      meta: { requiresAuth: true, role: 'CUSTOMER' }
    }
  ]
})


router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next('/login') 
    }
    
    if (to.meta.role && authStore.role !== to.meta.role) {
      return next(authStore.role === 'ADMIN' ? '/' : '/customer-portal')
    }
  }

  
  if (to.path === '/login' && authStore.isAuthenticated) {
    return next(authStore.role === 'ADMIN' ? '/' : '/customer-portal')
  }

  next()
})

export default router