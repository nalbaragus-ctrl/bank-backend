import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '../services/api'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(JSON.parse(localStorage.getItem('auth_user')) || null)
    const role = ref(localStorage.getItem('auth_role') || null)
    const isAuthenticated = ref(!!localStorage.getItem('auth_role'))

    async function login(email, password) {
        try {
            const response = await apiClient.post('/login', { email, password })
            const data = response.data

            
            user.value = data.user
            role.value = data.role
            isAuthenticated.value = true

           
            localStorage.setItem('auth_user', JSON.stringify(data.user))
            localStorage.setItem('auth_role', data.role)

            return { success: true, role: data.role }
        } catch (err) {
            console.error(err)
            return { 
                success: false, 
                message: err.response?.data?.message || 'Gagal terhubung ke server auth.' 
            }
        }
    }

    function logout() {
        user.value = null
        role.value = null
        isAuthenticated.value = false
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_role')
    }

    return {
        user,
        role,
        isAuthenticated,
        login,
        logout
    }
})