import { ref, onMounted } from 'vue'
import { useMealStore } from '@/stores/mealStore'
import { getPendingMeals } from '@/services/offlineService'

// Global singleton state
const globalIsOnline = ref(navigator.onLine)
const globalPendingMealsCount = ref(0)
const globalLastCheck = ref(Date.now())
let isInitialized = false
let isSyncing = false

export function useOfflineStatus() {
  const mealStore = useMealStore()

  // Check for pending meals (updates global state)
  const checkPendingMeals = async () => {
    try {
      const pendingMeals = await getPendingMeals()
      const newCount = pendingMeals.length

      if (globalPendingMealsCount.value !== newCount) {
        console.log(
          `📊 Pending meals count updated: ${globalPendingMealsCount.value} → ${newCount}`,
        )
        globalPendingMealsCount.value = newCount
      }

      globalLastCheck.value = Date.now()
    } catch (error) {
      console.error('Failed to check pending meals:', error)
      globalPendingMealsCount.value = 0
    }
  }

  // Handle online/offline status changes (singleton)
  const handleOnlineStatusChange = async () => {
    const wasOffline = !globalIsOnline.value
    const previousPendingCount = globalPendingMealsCount.value
    globalIsOnline.value = navigator.onLine
    mealStore.updateOnlineStatus()

    console.log(
      `🌐 Network status changed: ${wasOffline ? 'offline' : 'online'} → ${navigator.onLine ? 'online' : 'offline'}`,
    )

    if (navigator.onLine && wasOffline && !isSyncing) {
      // Coming back online - try to sync pending meals (only once)
      isSyncing = true
      console.log('🔄 Coming back online, attempting to sync pending meals...')

      try {
        await mealStore.processPendingMeals()
        await checkPendingMeals()

        // Show success message if meals were synced
        if (previousPendingCount > 0 && globalPendingMealsCount.value === 0) {
          const mealText = previousPendingCount === 1 ? 'meal' : 'meals'
          console.log(`✅ Successfully synced ${previousPendingCount} ${mealText}!`)
        }
      } finally {
        isSyncing = false
      }
    } else if (!navigator.onLine) {
      // Going offline - check for pending meals
      console.log('📱 Going offline, checking for pending meals...')
      await checkPendingMeals()
    }
  }

  // Force refresh pending meals count
  const forceRefresh = async () => {
    console.log('🔄 Force refreshing pending meals count...')
    await checkPendingMeals()
  }

  // Initialize global event listeners (only once)
  const initializeGlobalListeners = () => {
    if (isInitialized) return

    console.log('🚀 Initializing global offline status listeners')
    isInitialized = true

    // Initial check
    checkPendingMeals()

    // Listen for online/offline events (only once globally)
    window.addEventListener('online', handleOnlineStatusChange)
    window.addEventListener('offline', handleOnlineStatusChange)
  }

  onMounted(() => {
    initializeGlobalListeners()
  })

  // Note: We don't remove listeners in onUnmounted because they're global
  // and should persist across component lifecycles

  return {
    isOnline: globalIsOnline,
    pendingMealsCount: globalPendingMealsCount,
    checkPendingMeals,
    forceRefresh,
    lastCheck: globalLastCheck,
  }
}
