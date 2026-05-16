import apiClient from './api'

export const depositoTypeService = {
    // Ambil semua tipe deposito
    getAllTypes() {
        return apiClient.get('/deposito-types')
    },

    // Update nama dan interest rate berdasarkan ID
    updateType(id, updatedData) {
        return apiClient.put(`/deposito-types/${id}`, updatedData)
    }
}