import apiClient from './api'

export const transactionService = {
    // Mengirim data DEPOSIT atau WITHDRAW ke Laravel
    createTransaction(transactionData) {
        return apiClient.post('/transactions', transactionData)
    },

    // Mengambil riwayat rekening spesifik milik nasabah beserta log transaksinya
    getAccountDetails(accountId) {
        return apiClient.get(`/accounts/${accountId}`)
    }
}