// stores/mealStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/services/api' // Adjust path as needed

// Interfaces
export interface MealCollection {
  id?: string
  deptname: string
  fullname: string
  entraadname: string
  count: number
  entity: string
  timestamp?: string
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

  // Utility to clear error state
  const clearError = () => {
    error.value = null
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

  const saveMealCollection = async (
    fullname: string,
    entraAD: string,
    deptname: string,
    portionCount: number,
    entity: string,
  ): Promise<boolean> => {
    const mealCollection: MealCollection = {
      fullname,
      entraadname: entraAD,
      deptname,
      count: portionCount,
      entity,
      timestamp: new Date().toISOString(),
    }

    try {
      await callApi('/mobile/submit_meal_check_in', mealCollection)
      return true
    } catch {
      return false
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

  const exportReport = async (
    endpoint: '/admin/export_pdf' | '/admin/export_excel',
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

  const exportReportPDF = (date: string, departments: string[] = []) =>
    exportReport('/admin/export_pdf', date, departments)

  const exportReportExcel = (date: string, departments: string[] = []) =>
    exportReport('/admin/export_excel', date, departments)

  return {
    isLoading,
    error,
    clearError,

    // Mobile
    getTodayMealCount,
    saveMealCollection,

    // Admin
    getReportDataByDate,
    exportReportPDF,
    exportReportExcel,
  }
})
