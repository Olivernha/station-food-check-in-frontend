// composables/useMealCount.ts
import { ref, watch } from 'vue'
import { useMealStore } from '../stores/mealStore'
import { useAuthStore } from '../stores/auth'

export function useMealCount() {
  const mealStore = useMealStore()
  const authStore = useAuthStore()

  const todaysCollections = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Fetch user's daily meal count
  const fetchUserMealCount = async () => {
    if (!authStore.user?.entraAd || !authStore.user?.department || !authStore.user?.entity) {
      console.log('Missing user data:', {
        entraId: authStore.user?.entraAd,
        department: authStore.user?.department,
        entity: authStore.user?.entity,
      })
      return
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('Fetching meal count for user:', authStore.user.entraAd)
      const count = await mealStore.getTodayMealCount(
        authStore.user.entraAd,
        authStore.user.department,
        authStore.user.entity,
      )
      console.log('Received meal count:', count)
      todaysCollections.value = count
    } catch (err) {
      console.error('Error fetching user meal count:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch meal count'
    } finally {
      isLoading.value = false
    }
  }

  // Watch for auth user changes
  watch(
    () => authStore.user,
    async (newUser) => {
      console.log('Auth user changed:', newUser)
      if (newUser) {
        await fetchUserMealCount()
      } else {
        // Reset when user logs out
        todaysCollections.value = 0
        error.value = null
      }
    },
    { immediate: true },
  )

  // Refresh meal count manually
  const refreshMealCount = async () => {
    await fetchUserMealCount()
  }

  return {
    todaysCollections,
    isLoading,
    error,
    fetchUserMealCount,
    refreshMealCount,
  }
}
