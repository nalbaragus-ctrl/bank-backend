import apiClient from './api'

export const accountService = {
    // GET: Ambil semua rekening
    getAllAccounts() {
        return apiClient.get('/accounts')
    },

    // POST: Buka rekening baru
    createNewAccount(accountData) {
        return apiClient.post('/accounts', accountData)
    },

    // ➕ PUT: Update nama paket dan tipe deposito berdasarkan ID
    updateAccount(id, updatedData) {
        return apiClient.put(`/accounts/${id}`, updatedData)
    },

    // ➕ DELETE: Hapus rekening berdasarkan ID
    deleteAccount(id) {
        return apiClient.delete(`/accounts/${id}`)
    }
}