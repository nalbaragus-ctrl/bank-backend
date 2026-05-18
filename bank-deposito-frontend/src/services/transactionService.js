import apiClient from './api'

export const transactionService = {
   
    createTransaction(transactionData) {
        return apiClient.post('/transactions', transactionData)
    },

   
    getAccountDetails(accountId) {
        return apiClient.get(`/accounts/${accountId}`)
    }
}