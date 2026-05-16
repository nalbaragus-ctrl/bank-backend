import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import CustomersView from '../views/CustomersView.vue'
import DepositoSettingsView from '../views/DepositoSettingsView.vue'

const routes = [
    {
        path: '/',
        name: 'dashboard',
        component: DashboardView
    },
    {
        // The :id makes this a dynamic route parameter, exactly like Laravel's {id}
        path: '/customers/:id',
        name: 'customer.detail',
        component: () => import('../views/DashboardView.vue') // Temporarily reusing this view as a placeholder
    },
    {
        path: '/customers',
        name: 'customers',
        component: CustomersView
    },
    {
        path: '/deposito-settings',
        name: 'deposito-settings',
        component: () => import('../views/DepositoSettingsView.vue')
    },
    {
        path: '/customer-portal',
        name: 'customer-portal',
        component: () => import('../views/CustomerPortalView.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// --- This is our Frontend Middleware (Navigation Guard) ---
router.beforeEach((to, from, next) => {
    // Mimicking Laravel's auth check
    const isAuthenticated = true // Change to false later when we build Auth logic
    
    console.log(`Navigating to: ${to.name}`)

    if (to.name !== 'login' && !isAuthenticated) {
        // If not logged in, redirect to login page
        next({ name: 'login' })
    } else {
        // Proceed normally
        next()
    }
})

export default router