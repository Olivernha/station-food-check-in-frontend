// stores/mealStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/services/api' // Adjust path as needed
import {
  saveMealForOfflineSubmission,
  getPendingMeals,
  removePendingMeal,
  registerMealSync,
  isBackgroundSyncSupported,
  shouldBlockCollection,
} from '@/services/offlineService' // Add this import

// Interfaces
export interface MealCollection {
  id?: string | number
  deptname: string
  fullname: string
  entraadname: string
  count: number
  entity: string
  price: number
  timestamp?: string
}

export interface MealHistoryRecord {
  
  count: number
  price: number
  datetime: string
}

export interface Department {
  id: string
  name: string
  totalCount: number
}

export interface ReportData {
  date: string
  total_record_count: number
  total_unique_staff: number
  departments: Department[]
}

// Store Definition
export const useMealStore = defineStore('meal', () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isOnline = ref(navigator.onLine) // Add online status tracking
  const isSyncing = ref(false) // Add sync lock

  // Utility to clear error state
  const clearError = () => {
    error.value = null
  }

  // Update online status
  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
  }

  // Generic API handler
  const callApi = async <T>(endpoint: string, payload?: any): Promise<T> => {
    try {
      isLoading.value = true
      const response = await apiClient.post<T>(endpoint, payload)
      return response.data
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'An unknown error occurred'
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  // Mobile Functions
  const getTodayMealCount = async (
    entraadname: string,
    deptname: string,
    entity: string,
  ): Promise<number> => {
    try {
      const res = await callApi<{ record_count: number }>('/mobile/get_today_meal_count_by_user', {
        entraadname,
        deptname,
        entity,
      })
      return res.record_count || 0
    } catch {
      return 0
    }
  }

  // Get user meal history
  const getUserMealHistory = async (
    entraadname: string,
    deptname: string,
    entity: string,
  ): Promise<MealHistoryRecord[]> => {
    try {
      // Calculate date range (last 2 days)
      const toDate = new Date().toISOString().split('T')[0]
      const fromDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const res = await callApi<{ record_history: MealHistoryRecord[] }>(
        '/mobile/get_recent_history_by_user',
        {
          entraadname,
          deptname,
          entity,
          from_date: fromDate,
          to_date: toDate,
        },
      )
      return res.record_history || []
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch meal history'
      error.value = message
      throw new Error(message)
    }
  }

  // Check if meal collection should be blocked due to old unsync data
  const checkCollectionBlocked = async (): Promise<{
    blocked: boolean
    reason?: string
    ageInDays?: number
  }> => {
    return await shouldBlockCollection()
  }

  const saveMealCollection = async (
    fullname: string,
    entraAD: string,
    deptname: string,
    portionCount: number,
    entity: string,
    totalAmount: number,
  ): Promise<{ success: boolean; blocked?: boolean; reason?: string }> => {
    // Check if collection should be blocked due to old unsync data
    const blockCheck = await shouldBlockCollection()
    if (blockCheck.blocked) {
      console.log('🚫 Meal collection blocked:', blockCheck.reason)
      return {
        success: false,
        blocked: true,
        reason: blockCheck.reason,
      }
    }

    // Ensure totalAmount is a number and round it to 2 decimal places
    const roundedTotalAmount = parseFloat(totalAmount.toFixed(2))

    const mealCollection: MealCollection = {
      fullname,
      entraadname: entraAD,
      deptname,
      count: portionCount,
      entity,
      price: roundedTotalAmount, // Use the rounded value
      timestamp: new Date().toISOString(),
    }
    console.log('📦 Saving meal collection:', mealCollection)
    // If offline, save to IndexedDB and register for sync
    if (!isOnline.value) {
      const saved = await saveMealForOfflineSubmission(mealCollection)
      if (saved) {
        // Try to register background sync if supported
        if (isBackgroundSyncSupported()) {
          await registerMealSync()
        }
        return { success: true }
      }
      return { success: false }
    }

    // If online, try to submit immediately
    try {
      await callApi('/mobile/submit_meal_check_in', mealCollection)
      return { success: true }
    } catch (error) {
      console.error('Error submitting meal collection:', error)
      // If submission fails, save for later
      const saved = await saveMealForOfflineSubmission(mealCollection)
      if (saved) {
        // Try to register background sync if supported
        if (isBackgroundSyncSupported()) {
          await registerMealSync()
        }
        return { success: true }
      }
      return { success: false }
    }
  }

  // Process pending meals when coming back online
  const processPendingMeals = async (): Promise<void> => {
    if (!isOnline.value || isSyncing.value) {
      console.log(
        `⏭️ Skipping sync - Online: ${isOnline.value}, Already syncing: ${isSyncing.value}`,
      )
      return
    }

    isSyncing.value = true
    console.log('🔄 Starting meal sync process...')

    try {
      const pendingMeals = await getPendingMeals()
      console.log(`📋 Found ${pendingMeals.length} pending meals to sync`)

      if (pendingMeals.length === 0) {
        console.log('✅ No pending meals to sync')
        return
      }

      let syncedCount = 0
      for (const meal of pendingMeals) {
        try {
          console.log(`📤 Syncing meal ID: ${meal.id}`, {
            portions: meal.count,
            amount: meal.price,
            user: meal.fullname,
          })

          await callApi('/mobile/submit_meal_check_in', meal)

          // If successful, remove from pending
          if (meal.id && typeof meal.id === 'number') {
            await removePendingMeal(meal.id)
            syncedCount++
            console.log(`✅ Successfully synced meal ID: ${meal.id}`)
          }
        } catch (error) {
          console.error(`❌ Failed to submit pending meal ID: ${meal.id}`, error)
          // Keep in pending for next attempt
        }
      }

      console.log(
        `🎉 Sync complete! Successfully synced ${syncedCount}/${pendingMeals.length} meals`,
      )

      // Dispatch a custom event to notify UI components
      window.dispatchEvent(
        new CustomEvent('mealSyncComplete', {
          detail: { syncedCount, totalCount: pendingMeals.length },
        }),
      )
    } finally {
      isSyncing.value = false
    }
  }

  // Admin Functions
  const getReportDataByDate = async (date: string): Promise<ReportData> => {
    try {
      const result = await callApi<ReportData[]>('/admin/data_by_date', { date })
      return (
        result?.[0] || {
          date,
          total_record_count: 0,
          total_unique_staff: 0,
          departments: [],
        }
      )
    } catch {
      return {
        date,
        total_record_count: 0,
        total_unique_staff: 0,
        departments: [],
      }
    }
  }

  const deleteMealEntry = async (recordId: string): Promise<boolean> => {
    try {
      await callApi('/admin/soft_delete_meal_record', {
        record_id: recordId,
      })
      return true
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to delete meal entry'
      error.value = message
      throw new Error(message)
    }
  }

  const exportReport = async (
    endpoint: '/admin/export_excel_record' | '/admin/export_excel_record_by_department',
    date: string,
    departments: string[] = [],
  ): Promise<boolean> => {
    try {
      const response = await apiClient.post(
        endpoint,
        { date, departments: departments.length ? departments : undefined },
        { responseType: 'blob' },
      )

      const ext = endpoint.endsWith('pdf') ? 'pdf' : 'xlsx'
      const url = URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `meal-report-${date}.${ext}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Export failed'
      return false
    }
  }

  const exportReportExcel = (date: string, departments: string[] = []) => {
    const endpoint = departments.length
      ? '/admin/export_excel_record_by_department'
      : '/admin/export_excel_record'

    return exportReport(endpoint, date, departments)
  }

  return {
    isLoading,
    error,
    isOnline,
    isSyncing,
    clearError,
    updateOnlineStatus,

    // Mobile
    getTodayMealCount,
    getUserMealHistory,
    saveMealCollection,
    processPendingMeals,
    checkCollectionBlocked,

    // Admin
    getReportDataByDate,
    exportReportExcel,
    deleteMealEntry,
  }
})
