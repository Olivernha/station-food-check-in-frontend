import { ref, computed, onMounted } from 'vue'

interface Department {
  deptname: string
  entity: string
}

export function useDepartments() {
  const allDepartments = ref<Department[]>([])
  const selectedDepartments = ref<string[]>([])
  const isLoadingDepartments = ref(false)
  const error = ref<string | null>(null)

  const fetchDepartments = async () => {
    isLoadingDepartments.value = true
    error.value = null
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/department_list`) // adjust base URL if needed
      const data = await res.json()
      allDepartments.value = data
    } catch (err) {
      console.error('Error fetching department list:', err)
      error.value = 'Failed to fetch department list'
    } finally {
      isLoadingDepartments.value = false
    }
  }

  const availableDepartments = computed(() => {
    return allDepartments.value.map((dept) => dept.deptname)
  })

  const selectAll = () => {
    selectedDepartments.value = [...availableDepartments.value]
  }

  const deselectAll = () => {
    selectedDepartments.value = []
  }

  onMounted(() => {
    fetchDepartments()
  })

  return {
    allDepartments,
    availableDepartments,
    selectedDepartments,
    isLoadingDepartments,
    error,
    fetchDepartments,
    selectAll,
    deselectAll,
  }
}
