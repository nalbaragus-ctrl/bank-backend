import apiClient from './api'

export const customerService = {
    getAllCustomers() {
        return apiClient.get('/customers')
    },

    createCustomer(customerData) {
        return apiClient.post('/customers', customerData)
    },

    
    updateCustomer(id, updatedData) {
        return apiClient.put(`/customers/${id}`, updatedData)
    },

   
    deleteCustomer(id) {
        return apiClient.delete(`/customers/${id}`)
    }
}