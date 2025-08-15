import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface MealCollection {
  id: string
  department_id: string
  date: string
  fullname: string
  entraAD: string
  count: number
  timestamp: string
}

export interface Department {
  id: string
  name: string
  totalCount: number
}

export interface DailySummary {
  id: string
  date: string
  departments: Department[]
}

export const useMealStore = defineStore('meal', () => {
  // State
  const dailySummaries = ref<DailySummary[]>([])
  const mealCollections = ref<MealCollection[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // API Configuration
  const API_BASE_URL = 'http://localhost:3000'

  // Computed
  const todaysSummary = computed(() => {
    const today = getTodayDateString()
    return dailySummaries.value.find((summary) => summary.id === today)
  })

  const totalStaffToday = computed(() => {
    return todaysSummary.value?.departments.reduce((total, dept) => total + dept.totalCount, 0) || 0
  })

  const totalPortionsToday = computed(() => {
    const today = getTodayDateString()
    return mealCollections.value
      .filter((collection) => collection.date.startsWith(today))
      .reduce((total, collection) => total + collection.count, 0)
  })

  // Helper Functions
  const generateId = (): string => {
    return Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9)
  }

  const getTodayDateString = (): string => {
    return new Date().toISOString().split('T')[0]
  }

  const getDepartmentId = (department: string, date: string): string => {
    return `dept_${department.toLowerCase().replace(/\s+/g, '_')}_${date}`
  }

  // API Functions
  const fetchDailySummaries = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/mealcollections`)
      if (!response.ok) {
        throw new Error('Failed to fetch daily summaries')
      }

      const data = await response.json()
      dailySummaries.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Error fetching daily summaries:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchMealCollections = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/collectionrecords`)
      if (!response.ok) {
        throw new Error('Failed to fetch meal collections')
      }

      const data = await response.json()
      mealCollections.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Error fetching meal collections:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchTodaysSummary = async (): Promise<DailySummary | null> => {
    const today = getTodayDateString()

    try {
      const response = await fetch(`${API_BASE_URL}/daily_summaries/${today}`)
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (err) {
      console.error("Error fetching today's summary:", err)
      return null
    }
  }

  const saveMealCollection = async (
    fullname: string,
    entraAD: string,
    department: string,
    portionCount: number,
  ): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    const today = getTodayDateString()
    const departmentId = getDepartmentId(department, today)

    try {
      // First, ensure daily summary exists for today
      await ensureDailySummary(today, department, departmentId, portionCount)

      // Then save the meal collection
      const mealCollection: MealCollection = {
        id: generateId(),
        department_id: departmentId,
        date: new Date().toISOString(),
        fullname,
        entraAD,
        count: portionCount,
        timestamp: new Date().toISOString(),
      }

      const response = await fetch(`${API_BASE_URL}/collectionrecords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mealCollection),
      })

      if (!response.ok) {
        throw new Error('Failed to save meal collection')
      }

      // Update local state
      mealCollections.value.push(mealCollection)

      console.log('Meal collection saved successfully:', mealCollection)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save meal collection'
      console.error('Error saving meal collection:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const ensureDailySummary = async (
    date: string,
    department: string,
    departmentId: string,
    portionCount: number,
  ): Promise<void> => {
    try {
      // Check if daily summary exists for today
      const summaryResponse = await fetch(`${API_BASE_URL}/mealcollections/${date}`)

      if (summaryResponse.ok) {
        // Summary exists, check if department exists in it
        const summary: DailySummary = await summaryResponse.json()
        const departmentIndex = summary.departments.findIndex((dept) => dept.id === departmentId)

        if (departmentIndex === -1) {
          // Add department to existing summary
          summary.departments.push({
            id: departmentId,
            name: department,
            totalCount: portionCount,
          })
        } else {
          // Update existing department count
          summary.departments[departmentIndex].totalCount += portionCount
        }

        await fetch(`${API_BASE_URL}/mealcollections/${date}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(summary),
        })

        // Update local state
        const localSummaryIndex = dailySummaries.value.findIndex((s) => s.id === date)
        if (localSummaryIndex !== -1) {
          dailySummaries.value[localSummaryIndex] = summary
        } else {
          dailySummaries.value.push(summary)
        }
      } else {
        // Create new daily summary
        const newSummary: DailySummary = {
          id: date,
          date: new Date(date).toISOString(),
          departments: [
            {
              id: departmentId,
              name: department,
              totalCount: portionCount,
            },
          ],
        }

        await fetch(`${API_BASE_URL}/mealcollections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newSummary),
        })

        // Update local state
        dailySummaries.value.push(newSummary)
      }
    } catch (err) {
      console.error('Error ensuring daily summary:', err)
      throw err
    }
  }

  const getMealCollectionsByDate = (date: string): MealCollection[] => {
    return mealCollections.value.filter((collection) => collection.date.startsWith(date))
  }

  const getMealCollectionsByDepartment = (departmentId: string): MealCollection[] => {
    return mealCollections.value.filter((collection) => collection.department_id === departmentId)
  }

  const getDepartmentStats = (
    departmentName: string,
    date?: string,
  ): {
    totalCollections: number
    totalPortions: number
    collections: MealCollection[]
  } => {
    const targetDate = date || getTodayDateString()
    const departmentId = getDepartmentId(departmentName, targetDate)
    const collections = getMealCollectionsByDepartment(departmentId)

    return {
      totalCollections: collections.length,
      totalPortions: collections.reduce((total, collection) => total + collection.count, 0),
      collections,
    }
  }

  // Initialize store
  const initialize = async (): Promise<void> => {
    await Promise.all([fetchDailySummaries(), fetchMealCollections()])
  }

  const clearError = (): void => {
    error.value = null
  }

  return {
    // State
    dailySummaries,
    mealCollections,
    isLoading,
    error,

    // Computed
    todaysSummary,
    totalStaffToday,
    totalPortionsToday,

    // Actions
    fetchDailySummaries,
    fetchMealCollections,
    fetchTodaysSummary,
    saveMealCollection,
    getMealCollectionsByDate,
    getMealCollectionsByDepartment,
    getDepartmentStats,
    initialize,
    clearError,

    // Helpers
    getTodayDateString,
    getDepartmentId,
  }
})
