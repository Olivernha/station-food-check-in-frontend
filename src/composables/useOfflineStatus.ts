import { ref, onMounted, onUnmounted } from 'vue'
import { useMealStore } from '@/stores/mealStore'
import { getPendingMeals } from '@/services/offlineService'

export function useOfflineStatus() {
  const mealStore = useMealStore()
  const isOnline = ref(navigator.onLine)
  const pendingMealsCount = ref(0)

  // Check for pending meals
  const checkPendingMeals = async () => {
    try {
      const pendingMeals = await getPendingMeals()
      pendingMealsCount.value = pendingMeals.length
    } catch (error) {
      console.error('Failed to check pending meals:', error)
      pendingMealsCount.value = 0
    }
  }

  // Handle online/offline status changes
  const handleOnlineStatusChange = async () => {
    const wasOffline = !isOnline.value
    const previousPendingCount = pendingMealsCount.value
    isOnline.value = navigator.onLine
    mealStore.updateOnlineStatus()

    if (navigator.onLine && wasOffline) {
      // Coming back online - try to sync pending meals
      console.log('Coming back online, attempting to sync pending meals...')
      await mealStore.processPendingMeals()
      await checkPendingMeals()

      // Show success message if meals were synced
      if (previousPendingCount > 0 && pendingMealsCount.value === 0) {
        const mealText = previousPendingCount === 1 ? 'meal' : 'meals'
        console.log(`✅ Successfully synced ${previousPendingCount} ${mealText}!`)

        // You could emit an event here for a success notification
        // For now, we'll just log it
      }
    } else if (!navigator.onLine) {
      // Going offline - check for pending meals
      await checkPendingMeals()
    }
  }

  onMounted(() => {
    // Initial check
    checkPendingMeals()

    // Listen for online/offline events
    window.addEventListener('online', handleOnlineStatusChange)
    window.addEventListener('offline', handleOnlineStatusChange)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnlineStatusChange)
    window.removeEventListener('offline', handleOnlineStatusChange)
  })

  return {
    isOnline,
    pendingMealsCount,
    checkPendingMeals,
  }
}
