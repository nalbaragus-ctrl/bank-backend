<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const handleLoginSubmit = async () => {
    if (!email.value || !password.value) {
        errorMessage.value = 'Harap isi seluruh kolom login!'
        return
    }

    isLoading.value = true
    errorMessage.value = ''

    const result = await authStore.login(email.value, password.value)

    if (result.success) {
        if (result.role === 'ADMIN') {
            router.push('/') 
        } else {
            router.push('/customer-portal') 
        }
    } else {
        errorMessage.value = result.message
    }
    isLoading.value = false
}
</script>

<template>
    <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div class="text-center mb-6">
                <span class="text-4xl"></span>
                <h1 class="text-2xl font-black text-slate-800 mt-2">Belimbing Deposito</h1>
                <p class="text-xs text-gray-500 mt-1">Silakan masuk untuk mengelola portofolio perbankan</p>
            </div>

            <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-lg mb-4 text-center">
                ⚠️ {{ errorMessage }}
            </div>

            <form @submit.prevent="handleLoginSubmit" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Email / Nama Nasabah</label>
                    <input v-model="email" type="text" placeholder="admin@bank.com atau Nama Nasabah" class="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-500" required />
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                    <input v-model="password" type="password" placeholder="••••••••" class="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-500" required />
                </div>

                <button type="submit" :disabled="isLoading" class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold p-3 rounded-xl text-sm transition duration-150 shadow-md cursor-pointer">
                    {{ isLoading ? 'Memverifikasi...' : 'Masuk ke Akun &rarr;' }}
                </button>
            </form>

            <div class="mt-6 bg-slate-50 p-4 rounded-xl border border-gray-200 text-[11px] text-gray-600 space-y-1">
                <p class="font-bold text-gray-700 uppercase mb-1">💡 Account Note:</p>
                <p>• <b>Admin:</b> <code class="bg-gray-200 px-1 rounded text-red-600">admin@bank.com</code> pass: <code class="bg-gray-200 px-1 rounded">admin123</code></p>
                <p>• <b>Nasabah:</b> Gunakan <u>Nama Lengkap</u> nasabah yang terdaftar di database, pass: <code class="bg-gray-200 px-1 rounded">nasabah123</code></p>
            </div>
        </div>
    </div>
</template>