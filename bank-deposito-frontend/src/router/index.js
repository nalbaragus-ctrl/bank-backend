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

// 🛡️ NAVIGATION GUARD: Proteksi Jalur Akses URL
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Jika halaman butuh login
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next('/login') // Tendang ke login jika belum auth
    }
    // Jika user memaksa masuk ke halaman yang bukan porsinya
    if (to.meta.role && authStore.role !== to.meta.role) {
      return next(authStore.role === 'ADMIN' ? '/' : '/customer-portal')
    }
  }

  // Jika sudah login tapi mencoba akses halaman login lagi
  if (to.path === '/login' && authStore.isAuthenticated) {
    return next(authStore.role === 'ADMIN' ? '/' : '/customer-portal')
  }

  next()
})

export default router