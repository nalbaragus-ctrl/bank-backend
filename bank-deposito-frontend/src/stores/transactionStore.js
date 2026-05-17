import { defineStore } from 'pinia'
import { ref } from 'vue'
import { transactionService } from '../services/transactionService'
import { useAccountStore } from './accountStore'

export const useTransactionStore = defineStore('transaction', () => {
    const currentAccountDetails = ref(null)
    const isLoading = ref(false)

    // Ambil detail akun & histori transaksi terbaru
    async function fetchAccountDetails(accountId) {
        isLoading.value = true
        try {
            const response = await transactionService.getAccountDetails(accountId)
            currentAccountDetails.value = response.data
        } catch (err) {
            console.error('Gagal mengambil detail akun:', err)
        } finally {
            isLoading.value = false
        }
    }

    async function executeTransaction(payload) {
        isLoading.value = true
        try {
            const response = await transactionService.createTransaction(payload)
            
            // 🔄 PERBAIKAN: Langsung perbarui data transaksi di state lokal Pinia menggunakan data kembalian API
            if (currentAccountDetails.value && response.data.transactions) {
                currentAccountDetails.value.balance = response.data.current_balance
                currentAccountDetails.value.transactions = response.data.transactions
            } else {
                // Fallback: Ambil data ulang dari API jika state kosong
                await fetchAccountDetails(payload.account_id)
            }
            
            // Refresh data akun global agar sync dengan admin dashboard
            const accountStore = useAccountStore()
            if (accountStore.fetchAccountsFromAPI) {
                accountStore.fetchAccountsFromAPI()
            }

            return { success: true, data: response.data }
        } catch (err) {
            console.error(err)
            return { 
                success: false, 
                message: err.response?.data?.message || 'Terjadi kesalahan sistem bursa.' 
            }
        } finally {
            isLoading.value = false
        }
    }

    return {
        currentAccountDetails,
        isLoading,
        fetchAccountDetails,
        executeTransaction
    }
})