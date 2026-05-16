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

    // Eksekusi transaksi (Deposit / Withdraw)
    async function executeTransaction(payload) {
        isLoading.value = true
        try {
            const response = await transactionService.createTransaction(payload)
            
            // Refresh data detail akun & log transaksi di UI saat ini
            await fetchAccountDetails(payload.account_id)
            
            // Refresh juga data akun global di store utama agar sync dengan dashboard admin
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