import { createApp } from 'vue'
import { createPinia } from 'pinia' // <--- 1. Import Pinia
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia() // <--- 2. Create the Pinia instance

app.use(router)
app.use(pinia) // <--- 3. Tell Vue to use Pinia

app.mount('#app')