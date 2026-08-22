// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import 'vue3-toastify/dist/index.css';

// 1. Create the App instance
const app = createApp(App)

// 2. Configure Pinia with state persistence
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 3. Register all plugins
app.use(pinia)
app.use(router)   // Registers RouterLink and RouterView
app.use(vuetify)  // Registers Vuetify components

// 4. Mount to DOM once the router has resolved its first navigation, so the
//    auth guard's redirect (if any) happens before anything is painted.
router.isReady().then(() => {
  app.mount('#app')
})