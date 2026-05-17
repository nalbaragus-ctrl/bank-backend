<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore' // Sesuaikan path jika letak store kamu berbeda

const authStore = useAuthStore()
const router = useRouter()

const handleAdminLogout = () => {
    // Jalankan fungsi pembersihan state di Pinia & LocalStorage
    authStore.logout()
    // Tendang admin kembali ke gerbang login
    router.push('/login')
}
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <div class="w-64 bg-slate-900 text-white p-6 flex flex-col justify-between shadow-xl">
      
      <div class="flex flex-col gap-y-6">
        <h2 class="text-xl font-black tracking-wide border-b border-slate-800 pb-4 text-emerald-400">
           Bank Deposito
        </h2>

        <nav class="flex flex-col gap-y-2">
          <RouterLink to="/" class="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition" active-class="bg-blue-600 text-white">
            Rekening Nasaabah
          </RouterLink>

          <RouterLink to="/customers" class="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition" active-class="bg-blue-600 text-white">
             Nasabah
          </RouterLink>

          <RouterLink to="/deposito-settings" class="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition" active-class="bg-blue-600 text-white">
             Jenis Deposito 
          </RouterLink>
        </nav>
      </div>

      <div class="border-t border-slate-800 pt-4 flex flex-col gap-y-3">
        <div class="text-xs text-slate-400 px-2">
          <p class="font-bold text-slate-300">Logged in as:</p>
          <p class="truncate text-blue-400">{{ authStore.user?.name || 'Admin' }}</p>
        </div>
        
        <button 
          @click="handleAdminLogout" 
          class="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs transition duration-200 cursor-pointer shadow-xs"
        >
           Logout Admin
        </button>
      </div>

    </div>

    <div class="flex-1 overflow-y-auto bg-slate-50">
      <slot />
    </div>
  </div>
</template>