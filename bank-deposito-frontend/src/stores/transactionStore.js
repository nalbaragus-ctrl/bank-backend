import { defineStore } from 'pinia'
import { ref } from 'vue'
import { transactionService } from '../services/transactionService'
import { useAccountStore } from './accountStore'

export const useTransactionStore = defineStore('transaction', () => {
    const currentAccountDetails = ref(null)
    const isLoading = ref(false)

    
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
            
            
            if (currentAccountDetails.value && response.data.transactions) {
                currentAccountDetails.value.balance = response.data.current_balance
                currentAccountDetails.value.transactions = response.data.transactions
            } else {
                
                await fetchAccountDetails(payload.account_id)
            }
            
            
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