import { defineStore } from 'pinia'
import { ref } from 'vue'
import { depositoTypeService } from '../services/depositoTypeService'

export const useDepositoTypeStore = defineStore('depositoType', () => {
    const types = ref([])
    const isLoading = ref(false)
    const error = ref(null)

    async function fetchTypesFromAPI() {
        isLoading.value = true
        error.value = null
        try {
            const response = await depositoTypeService.getAllTypes()
            types.value = response.data
        } catch (err) {
            console.error(err)
            error.value = 'Gagal memuat tipe deposito.'
        } finally {
            isLoading.value = false
        }
    }

    async function updateType(id, updatedData) {
        try {
            const response = await depositoTypeService.updateType(id, updatedData)
            const index = types.value.findIndex(t => t.id === id)
            if (index !== -1) {
                types.value[index] = response.data // Update state Vue secara instan
            }
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    return {
        types,
        isLoading,
        error,
        fetchTypesFromAPI,
        updateType
    }
})