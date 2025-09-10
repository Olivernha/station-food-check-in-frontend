// First, let's check your MSAL configuration and service
// Can you share your msal.ts and msalConfig.ts files?

// In the meantime, here's a corrected main.ts with proper error handling:

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { msalInstance } from './services/msal'
import { useAuthStore } from './stores/auth'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

async function initializeApp() {

  console.log('Starting MSAL initialization...')

  // Initialize MSAL first
  await msalInstance.initialize()
  console.log('MSAL initialized successfully')

  // Create Vue app and pinia
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)
  app.use(vuetify)

  // Now initialize auth store
  console.log('Initializing auth store...')
  const authStore = useAuthStore()
  await authStore.initialize()
  console.log('Auth store initialized successfully')

  // Mount the app
  app.mount('#app')
  console.log('App mounted successfully')
}

// Start the initialization
initializeApp()

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}
