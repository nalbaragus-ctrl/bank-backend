import { defineStore } from 'pinia'
import { ref } from 'vue'
import { customerService } from '../services/customerService'

export const useCustomerStore = defineStore('customer', () => {
    const customers = ref([])
    const isLoading = ref(false)
    const error = ref(null)

    async function fetchCustomersFromAPI() {
        isLoading.value = true
        error.value = null
        try {
            const response = await customerService.getAllCustomers()
            customers.value = response.data
        } catch (err) {
            console.error(err)
            error.value = 'Gagal memuat data nasabah.'
        } finally {
            isLoading.value = false
        }
    }

    async function createCustomer(newCustomerData) {
        isLoading.value = true
        try {
            const response = await customerService.createCustomer(newCustomerData)
            customers.value.push(response.data)
            return true
        } catch (err) {
            console.error(err)
            return false
        } finally {
            isLoading.value = false
        }
    }

    
    async function updateCustomer(id, updatedData) {
        try {
            const response = await customerService.updateCustomer(id, updatedData)
            const index = customers.value.findIndex(c => c.id === id)
            if (index !== -1) {
                customers.value[index] = response.data // Timpa dengan data baru dari Laravel
            }
            return true
        } catch (err) {
            console.error(err)
            alert(err.response?.data?.message || 'Gagal mengubah nama nasabah.')
            return false
        }
    }

    
    async function deleteCustomer(id) {
        try {
            await customerService.deleteCustomer(id)
            customers.value = customers.value.filter(c => c.id !== id) // Hapus dari UI tabel langsung
            return true
        } catch (err) {
            console.error(err)
            
            alert(err.response?.data?.message || 'Gagal menghapus nasabah.')
            return false
        }
    }

    return {
        customers,
        isLoading,
        error,
        fetchCustomersFromAPI,
        createCustomer,
        updateCustomer,
        deleteCustomer
    }
})