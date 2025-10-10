import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { msalInstance } from './services/msal'
import { useAuthStore } from './stores/auth'
import { useMealStore } from './stores/mealStore' // Add this import
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
  pinia.use(piniaPluginPersistedstate) // Add persisted state plugin

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
