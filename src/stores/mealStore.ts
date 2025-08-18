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

  const getDepartmentNameFromId = (departmentId: string): string => {
    // Extract department name from ID format: dept_department_name_date
    const parts = departmentId.split('_')
    if (parts.length >= 3) {
      // Join all parts except 'dept' and the last part (date)
      return parts
        .slice(1, -1)
        .join(' ')
        .replace(/\b\w/g, (l) => l.toUpperCase())
    }
    return 'Unknown Department'
  }

  const exportReportPDF = async (
    selectedDate: string,
    selectedDepartments: string[],
  ): Promise<void> => {
    // Dynamic import for jsPDF
    const { jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const reportDate = new Date(selectedDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    // Filter and group data
    const { departmentGroups, totalStaff, totalPortions } = getFilteredReportData(
      selectedDate,
      selectedDepartments,
    )

    const doc = new jsPDF()

    // Header
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Meal Check Report Dashboard', 105, 20, { align: 'center' })

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`For the date of ${reportDate}`, 105, 30, { align: 'center' })

    // Summary
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Total Staff: ${totalStaff}`, 20, 45)
    doc.text(`Total Portions: ${totalPortions}`, 150, 45)

    let yPosition = 60

    // Department sections
    Object.keys(departmentGroups).forEach((departmentName) => {
      const collections = departmentGroups[departmentName]
      const deptStaff = collections.length
      const deptPortions = collections.reduce((sum, c) => sum + c.count, 0)

      // Department header
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(departmentName, 20, yPosition)
      yPosition += 10

      // Table data
      const tableData = collections.map((collection, index) => {
        const time = new Date(collection.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
        return [(index + 1).toString(), collection.fullname, time, collection.count.toString()]
      })

      // Add table
      autoTable(doc, {
        startY: yPosition,
        head: [['s/n', 'Name', 'Time Collected', 'Meal Count']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
        margin: { left: 20, right: 20 },
        didDrawPage: (data) => {
          yPosition = data.cursor?.y || yPosition
        },
      })

      yPosition += 10

      // Department footer
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(`Staff: ${deptStaff}`, 20, yPosition)
      doc.text(`Portions: ${deptPortions}`, 150, yPosition)
      yPosition += 20

      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }
    })

    // Save the PDF
    doc.save(`meal-report-${selectedDate}.pdf`)
  }

  const exportReportExcel = async (
    selectedDate: string,
    selectedDepartments: string[],
  ): Promise<void> => {
    // Dynamic import for xlsx
    const XLSX = await import('xlsx')

    const reportDate = new Date(selectedDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    // Filter and group data
    const { departmentGroups, totalStaff, totalPortions } = getFilteredReportData(
      selectedDate,
      selectedDepartments,
    )

    const workbook = XLSX.utils.book_new()

    // Summary sheet
    const summaryData = [
      ['Meal Check Report Dashboard'],
      [`For the date of ${reportDate}`],
      [''],
      ['Total Staff', totalStaff.toString()],
      ['Total Portions', totalPortions.toString()],
      [''],
    ]

    // Add department data
    Object.keys(departmentGroups).forEach((departmentName) => {
      const collections = departmentGroups[departmentName]
      const deptStaff = collections.length
      const deptPortions = collections.reduce((sum, c) => sum + c.count, 0)

      summaryData.push([departmentName])
      summaryData.push(['s/n', 'Name', 'Time Collected', 'Meal Count'])

      collections.forEach((collection, index) => {
        const time = new Date(collection.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
        summaryData.push([
          (index + 1).toString(),
          collection.fullname,
          time,
          collection.count.toString(),
        ])
      })

      summaryData.push([`Staff: ${deptStaff}`, '', '', `Portions: ${deptPortions}`])
      summaryData.push([''])
    })

    const worksheet = XLSX.utils.aoa_to_sheet(summaryData)

    // Set column widths
    worksheet['!cols'] = [{ width: 15 }, { width: 25 }, { width: 15 }, { width: 12 }]

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Meal Report')

    // Create detailed sheet for each department
    Object.keys(departmentGroups).forEach((departmentName) => {
      const collections = departmentGroups[departmentName]
      const deptData = [[departmentName], [''], ['s/n', 'Name', 'Time Collected', 'Meal Count']]

      collections.forEach((collection, index) => {
        const time = new Date(collection.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
        deptData.push([
          (index + 1).toString(),
          collection.fullname,
          time,
          collection.count.toString(),
        ])
      })

      const deptWorksheet = XLSX.utils.aoa_to_sheet(deptData)
      deptWorksheet['!cols'] = [{ width: 10 }, { width: 25 }, { width: 15 }, { width: 12 }]

      const sheetName =
        departmentName.length > 31 ? departmentName.substring(0, 28) + '...' : departmentName
      XLSX.utils.book_append_sheet(workbook, deptWorksheet, sheetName)
    })

    // Save the Excel file
    XLSX.writeFile(workbook, `meal-report-${selectedDate}.xlsx`)
  }

  const getFilteredReportData = (selectedDate: string, selectedDepartments: string[]) => {
    // Filter collections by date and departments
    const filteredCollections = mealCollections.value.filter((collection) => {
      const collectionDate = collection.date.split('T')[0]
      const departmentName = getDepartmentNameFromId(collection.department_id)
      return collectionDate === selectedDate && selectedDepartments.includes(departmentName)
    })

    // Group collections by department
    const departmentGroups: { [key: string]: MealCollection[] } = {}
    filteredCollections.forEach((collection) => {
      const departmentName = getDepartmentNameFromId(collection.department_id)
      if (!departmentGroups[departmentName]) {
        departmentGroups[departmentName] = []
      }
      departmentGroups[departmentName].push(collection)
    })

    // Calculate totals
    const totalStaff = Object.keys(departmentGroups).reduce((total, dept) => {
      return total + departmentGroups[dept].length
    }, 0)

    const totalPortions = filteredCollections.reduce((total, collection) => {
      return total + collection.count
    }, 0)

    return { filteredCollections, departmentGroups, totalStaff, totalPortions }
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

    exportReportPDF,
    exportReportExcel,

    // Helpers
    getTodayDateString,
    getDepartmentId,
  }
})
