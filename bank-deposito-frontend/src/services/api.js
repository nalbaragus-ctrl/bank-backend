import axios from 'axios'

// 1. Membuat Instance Axios dengan konfigurasi dasar
const apiClient = axios.create({
    // Sesuaikan dengan URL project Laravel kamu saat dijalankan (biasanya port 8000)
    baseURL: 'http://127.000.0.1:8000/api', 
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    timeout: 10000 // Batas waktu tunggu 10 detik, jika lebih maka dianggap timeout
})

// 2. Request Interceptor (Pencegat Sebelum Request Terkirim)
// Ini seperti middleware pembawa token otomatis
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 3. Response Interceptor (Pencegat Setelah Respon Diterima)
// Ini seperti middleware pengecek status login
apiClient.interceptors.response.use(
    (response) => response, // Jika sukses (200, 201), loloskan saja
    (error) => {
        // Jika backend Laravel merespon dengan status 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
            console.warn('Token tidak valid atau kedaluwarsa. Mengarahkan ke login...')
            localStorage.removeItem('auth_token')
            // Di sini kita bisa paksa redirect ke login jika sudah ada routernya nanti
        }
        return Promise.reject(error)
    }
)

export default apiClient