import apiClient from './api'

export const accountService = {
    
    getAllAccounts() {
        return apiClient.get('/accounts')
    },

    
    createNewAccount(accountData) {
        return apiClient.post('/accounts', accountData)
    },

    
    updateAccount(id, updatedData) {
        return apiClient.put(`/accounts/${id}`, updatedData)
    },

    
    deleteAccount(id) {
        return apiClient.delete(`/accounts/${id}`)
    }
}