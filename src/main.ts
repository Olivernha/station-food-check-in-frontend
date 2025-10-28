import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import { useMealStore } from './stores/mealStore'
import { useOfflineStatus } from './composables/useOfflineStatus'
import { msalInstance } from './services/msal'
import { useAuthStore } from './stores/auth'

// Vuetify setup
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
  },
})

// Pinia setup
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// App initialization
const initializeApp = async () => {
  try {
    // Initialize MSAL before anything else
    await msalInstance.initialize()
    console.log('MSAL initialized successfully')
  } catch (error) {
    console.error('MSAL initialization failed:', error)
  }

  const app = createApp(App)
  app.use(pinia)
  app.use(router)
  app.use(vuetify)

  // Mount the app
  app.mount('#app')
  console.log('App mounted successfully')

  // Initialize auth store
  const authStore = useAuthStore()
  await authStore.initialize()

  // Initialize meal store and set up online/offline listeners
  const mealStore = useMealStore()

  // Set up online/offline event listeners
  window.addEventListener('online', () => {
    console.log('App is now online')
    mealStore.updateOnlineStatus()
    // Process pending meals when coming back online
    mealStore.processPendingMeals()
  })

  window.addEventListener('offline', () => {
    console.log('App is now offline')
    mealStore.updateOnlineStatus()
  })

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'MEAL_SYNC_COMPLETE') {
      console.log('Meal sync completed, updating UI');
      // Refresh the pending meals count
      useOfflineStatus().checkPendingMeals();
    }
  });
}

// Start the initialization
initializeApp()

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Function to register service worker with fallback
    const registerServiceWorker = async (swPath: string) => {
      try {
        const registration = await navigator.serviceWorker.register(swPath)
        console.log('SW registered: ', registration)
        return registration
      } catch (error) {
        console.log(`SW registration failed for ${swPath}: `, error)
        throw error
      }
    }

    // Try to register service worker with different paths
    const tryRegister = async () => {
      const pathsToTry = [
        '/dev-dist/sw.js', // Development path
        '/sw.js',          // Production path
        './dev-dist/sw.js',
        './sw.js'
      ]

      for (const path of pathsToTry) {
        try {
          await registerServiceWorker(path)
          console.log(`Successfully registered service worker with path: ${path}`)
          return
        } catch (error) {
          console.log(`Failed to register with path ${path}:`, error)
          continue
        }
      }

      console.log('Failed to register service worker with all paths')
    }

    tryRegister()
  })
}
