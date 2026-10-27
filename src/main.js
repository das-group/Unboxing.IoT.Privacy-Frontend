import { createApp } from 'vue'
import App from './App.vue'

// Vue Router
import router from './router'

// Axios
import axios from 'axios'
import VueAxios from 'vue-axios'

// Pinia
import { createPinia } from 'pinia'

// Bootstrap
import 'bootstrap/scss/bootstrap.scss'
// Icons
import 'bootstrap-icons/font/bootstrap-icons.scss'
// Expose Bootstrap
import * as bootstrap from 'bootstrap'
window.bootstrap = bootstrap

// Flag Icons
import 'flag-icons/sass/flag-icons.scss'

// CSS
import '@/assets/style.scss'

const app = createApp(App)

// Pinia
const pinia = createPinia()
app.use(pinia)

// Axios
app.use(VueAxios, axios)

// User auth / session
import { useAuth } from '@/stores/auth'
const auth = useAuth()
await auth.loadSession()

// Vue Router
app.use(router)

app.mount('#app')
