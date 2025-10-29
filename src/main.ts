import vuetify from './plugins/vuetify'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import { useMealStore } from './stores/mealStore'
import { useOfflineStatus } from './composables/useOfflineStatus'
import { msalInstance } from './services/msal'
import { useAuthStore } from './stores/auth'

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

  // Initialize offline status composable to set up global listeners
  const offlineStatus = useOfflineStatus()

  // Check for pending meals on app startup
  console.log('🚀 App startup: checking for pending meals to sync...')
  setTimeout(async () => {
    await offlineStatus.triggerSyncOnActive()
  }, 1000)

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

  // Handle page visibility changes (when user returns to tab)
  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden) {
      console.log('👁️ Page became visible - triggering sync check...')
      setTimeout(async () => {
        await offlineStatus.triggerSyncOnActive()
      }, 500)
    }
  })

  // Handle window focus (when user returns to window)
  window.addEventListener('focus', async () => {
    console.log('🎯 Window focused - triggering sync check...')
    setTimeout(async () => {
      await offlineStatus.triggerSyncOnActive()
    }, 500)
  })

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'MEAL_SYNC_COMPLETE') {
      console.log('Meal sync completed, updating UI')
      // Refresh the pending meals count
      useOfflineStatus().checkPendingMeals()
    }
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
        '/sw.js', // Production path
        './dev-dist/sw.js',
        './sw.js',
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
