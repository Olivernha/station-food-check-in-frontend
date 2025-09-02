import { defineStore } from 'pinia'
import { ref } from 'vue'

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
  departments: any[]
}

export const useMealStore = defineStore('meal', () => {
  const mealCollections = ref<MealCollection[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL

  const handleResponse = async (response: Response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Request failed')
    }
    return response.json()
  }

  const fetchAPI = async (endpoint: string, body: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      return await handleResponse(response)
    } catch (err) {
      console.error(`API error [${endpoint}]:`, err)
      throw err
    }
  }

  // Mobile functions
  const getTodayMealCount = async (entraadname: string, deptname: string, entity: string) => {
    const result = await fetchAPI('/mobile/get_today_meal_count_by_user', {
      entraadname,
      deptname,
      entity,
    })
    return result.record_count || 0
  }

  const saveMealCollection = async (
    fullname: string,
    entraAD: string,
    deptname: string,
    portionCount: number,
    entity: string,
  ): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    const mealCollection: MealCollection = {
      fullname,
      entraadname: entraAD,
      deptname,
      count: portionCount,
      entity,
      timestamp: new Date().toISOString(),
    }

    try {
      const saved = await fetchAPI('/mobile/submit_meal_check_in', mealCollection)
      mealCollections.value.push({ ...mealCollection, id: saved.id, timestamp: saved.timestamp })
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save meal collection'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Admin functions
  const getReportDataByDate = async (date: string): Promise<ReportData | null> => {
    isLoading.value = true
    error.value = null
    try {
      const data = await fetchAPI('/admin/data_by_date', { date })
      return data?.[0] || { date, total_record_count: 0, total_unique_staff: 0, departments: [] }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch report data'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const exportReport = async (
    endpoint: '/admin/export_pdf' | '/admin/export_excel',
    date: string,
    departments: string[] = [],
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, departments: departments.length ? departments : undefined }),
      })
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      const ext = endpoint.endsWith('pdf') ? 'pdf' : 'xlsx'
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `meal-report-${date}.${ext}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      return true
    } catch (err) {
      console.error('Export error:', err)
      error.value = err instanceof Error ? err.message : 'Failed to export report'
      return false
    }
  }

  const exportReportPDF = (date: string, departments: string[] = []) =>
    exportReport('/admin/export_pdf', date, departments)
  const exportReportExcel = (date: string, departments: string[] = []) =>
    exportReport('/admin/export_excel', date, departments)

  const clearError = () => {
    error.value = null
  }

  return {
    mealCollections,
    isLoading,
    error,
    getTodayMealCount,
    saveMealCollection,
    getReportDataByDate,
    exportReportPDF,
    exportReportExcel,
    clearError,
  }
})
