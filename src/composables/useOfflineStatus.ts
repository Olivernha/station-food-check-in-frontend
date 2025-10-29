import { ref, onMounted } from 'vue'
import { useMealStore } from '@/stores/mealStore'
import { getPendingMeals } from '@/services/offlineService'

// Global singleton state
const globalIsOnline = ref(navigator.onLine)
const globalPendingMealsCount = ref(0)
const globalLastCheck = ref(Date.now())
let isInitialized = false
let isSyncing = false
let periodicCheckInterval: number | null = null

export function useOfflineStatus() {
  const mealStore = useMealStore()

  // Check for pending meals (updates global state)
  const checkPendingMeals = async () => {
    try {
      const pendingMeals = await getPendingMeals()
      const newCount = pendingMeals.length

      console.log(`🔍 Checking pending meals: found ${newCount} meals`, {
        previousCount: globalPendingMealsCount.value,
        isOnline: globalIsOnline.value,
        timestamp: new Date().toLocaleTimeString(),
      })

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

        // Force refresh count after sync
        console.log('🔄 Refreshing pending meals count after sync...')
        await checkPendingMeals()

        // Show success message if meals were synced
        if (previousPendingCount > 0 && globalPendingMealsCount.value === 0) {
          const mealText = previousPendingCount === 1 ? 'meal' : 'meals'
          console.log(`✅ Successfully synced ${previousPendingCount} ${mealText}!`)

          // Dispatch success event for UI feedback
          window.dispatchEvent(
            new CustomEvent('offlineMealsSynced', {
              detail: { count: previousPendingCount },
            }),
          )
        } else if (globalPendingMealsCount.value > 0) {
          console.log(`⚠️ Still have ${globalPendingMealsCount.value} pending meals after sync`)
          // Start periodic check to keep monitoring
          startPeriodicCheck()
        } else {
          // No pending meals, stop periodic check
          stopPeriodicCheck()
        }
      } finally {
        isSyncing = false
      }
    } else if (!navigator.onLine) {
      // Going offline - check for pending meals and stop periodic check
      console.log('📱 Going offline, checking for pending meals...')
      stopPeriodicCheck()
      await checkPendingMeals()
    }
  }

  // Force refresh pending meals count
  const forceRefresh = async () => {
    console.log('🔄 Force refreshing pending meals count...')
    await checkPendingMeals()
  }

  // Handle sync complete events
  const handleSyncComplete = async (event: CustomEvent) => {
    console.log('🎉 Sync complete event received:', event.detail)
    // Force refresh the pending meals count after sync
    await checkPendingMeals()
  }

  // Start periodic check when online to ensure count stays accurate
  const startPeriodicCheck = () => {
    if (periodicCheckInterval) return

    console.log('⏰ Starting periodic pending meals check')
    periodicCheckInterval = window.setInterval(async () => {
      if (globalIsOnline.value && globalPendingMealsCount.value > 0) {
        console.log('⏰ Periodic check: refreshing pending meals count')
        await checkPendingMeals()
      }
    }, 3000) // Check every 3 seconds when online and have pending meals
  }

  // Stop periodic check
  const stopPeriodicCheck = () => {
    if (periodicCheckInterval) {
      console.log('⏰ Stopping periodic pending meals check')
      clearInterval(periodicCheckInterval)
      periodicCheckInterval = null
    }
  }

  // Initialize global event listeners (only once)
  const initializeGlobalListeners = () => {
    if (isInitialized) return

    console.log('🚀 Initializing global offline status listeners')
    isInitialized = true

    // Initial check
    checkPendingMeals()

    // Start periodic check if needed
    if (globalIsOnline.value && globalPendingMealsCount.value > 0) {
      startPeriodicCheck()
    }

    // Listen for online/offline events (only once globally)
    window.addEventListener('online', handleOnlineStatusChange)
    window.addEventListener('offline', handleOnlineStatusChange)

    // Listen for sync complete events
    window.addEventListener('mealSyncComplete', handleSyncComplete as unknown as EventListener)
  }

  onMounted(() => {
    initializeGlobalListeners()
  })

  // Note: We don't remove listeners in onUnmounted because they're global
  // and should persist across component lifecycles

  // Trigger sync when app becomes active (startup, tab focus, etc.)
  const triggerSyncOnActive = async () => {
    if (!globalIsOnline.value || isSyncing) {
      console.log('⏭️ Skipping active sync - offline or already syncing')
      return
    }

    const currentPendingCount = globalPendingMealsCount.value
    console.log(`🎯 App became active - checking ${currentPendingCount} pending meals for sync...`)

    if (currentPendingCount > 0) {
      isSyncing = true
      try {
        await mealStore.processPendingMeals()
        await checkPendingMeals()

        const newPendingCount = globalPendingMealsCount.value
        if (newPendingCount < currentPendingCount) {
          const syncedCount = currentPendingCount - newPendingCount
          console.log(`✅ Synced ${syncedCount} meals on app activation`)

          // Dispatch success event
          window.dispatchEvent(
            new CustomEvent('offlineMealsSynced', {
              detail: { count: syncedCount },
            }),
          )
        }
      } finally {
        isSyncing = false
      }
    } else {
      // Just refresh count to be sure
      await checkPendingMeals()
    }
  }

  // Debug function to manually trigger sync
  const debugSync = async () => {
    console.log('🐛 DEBUG: Manual sync triggered')
    console.log('🐛 Current state:', {
      isOnline: globalIsOnline.value,
      pendingCount: globalPendingMealsCount.value,
      isSyncing: isSyncing,
      lastCheck: new Date(globalLastCheck.value).toLocaleTimeString(),
    })

    if (globalIsOnline.value && !isSyncing) {
      await mealStore.processPendingMeals()
      await checkPendingMeals()
    } else {
      console.log('🐛 Cannot sync - offline or already syncing')
    }
  }

  return {
    isOnline: globalIsOnline,
    pendingMealsCount: globalPendingMealsCount,
    checkPendingMeals,
    forceRefresh,
    triggerSyncOnActive,
    lastCheck: globalLastCheck,
    debugSync,
  }
}
