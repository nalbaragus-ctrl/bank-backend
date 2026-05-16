import apiClient from './api'

export const customerService = {
    getAllCustomers() {
        return apiClient.get('/customers')
    },

    createCustomer(customerData) {
        return apiClient.post('/customers', customerData)
    },

    // ➕ PUT: Update nama customer berdasarkan ID
    updateCustomer(id, updatedData) {
        return apiClient.put(`/customers/${id}`, updatedData)
    },

    // ➕ DELETE: Hapus customer berdasarkan ID
    deleteCustomer(id) {
        return apiClient.delete(`/customers/${id}`)
    }
}