import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { accountService } from '../services/accountService'

export const useAccountStore = defineStore('account', () => {
    const accounts = ref([])
    const isLoading = ref(false)
    const error = ref(null)

    // Getter untuk total likuiditas (global backup)
    const totalBankLiquidity = computed(() => {
        return accounts.value.reduce((total, account) => total + (parseFloat(account.balance) || 0), 0)
    })

    // Action: Fetch data
    async function fetchAccountsFromAPI() {
        isLoading.value = true
        error.value = null
        try {
            const response = await accountService.getAllAccounts()
            accounts.value = response.data
        } catch (err) {
            console.error('Gagal memuat akun:', err)
            error.value = 'Gagal terhubung ke server Laravel.'
        } finally {
            isLoading.value = false
        }
    }

    // Action: Create
    async function createAccount(newAccountData) {
        isLoading.value = true
        try {
            const response = await accountService.createNewAccount(newAccountData)
            accounts.value.push(response.data)
            return true
        } catch (err) {
            console.error('Gagal membuat akun:', err)
            return false
        } finally {
            isLoading.value = false
        }
    }

    // ➕ ACTION BARU: UPDATE AKUN
    async function updateAccount(id, updatedData) {
        try {
            const response = await accountService.updateAccount(id, updatedData)
            
            // Cari data lama di dalam array Vue state, lalu timpa dengan data baru hasil response Laravel
            const index = accounts.value.findIndex(acc => acc.id === id)
            if (index !== -1) {
                accounts.value[index] = response.data
            }
            return true
        } catch (err) {
            console.error('Gagal mengupdate akun di Laravel:', err)
            alert(err.response?.data?.message || 'Gagal menyimpan perubahan ke database.')
            return false
        }
    }

    // ➕ ACTION BARU: HAPUS AKUN
    async function deleteAccount(id) {
        try {
            await accountService.deleteAccount(id)
            
            // Hapus data dari array Vue state agar baris di tabel langsung hilang secara instan
            accounts.value = accounts.value.filter(acc => acc.id !== id)
            return true
        } catch (err) {
            console.error('Gagal menghapus akun di Laravel:', err)
            alert(err.response?.data?.message || 'Gagal menghapus akun dari database.')
            return false
        }
    }

    return {
        accounts,
        isLoading,
        error,
        totalBankLiquidity,
        fetchAccountsFromAPI,
        createAccount,
        updateAccount, // Pastikan di-return agar bisa dibaca oleh DashboardView.vue
        deleteAccount  // Pastikan di-return agar bisa dibaca oleh DashboardView.vue
    }
})