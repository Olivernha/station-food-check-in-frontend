<template>
  <div class="admin-dashboard">
    <!-- Header -->
    <AppHeader
      title="Meal Check Report Dashboard"
      subtitle="Staff Meal Portion Tracking System"
      color="blue-grey-darken-3"
      :dark="true"
      :height="70"
      :show-logo="true"
      icon="mdi-food"
      :icon-size="24"
      header-class="px-6"
      justify="start"
      title-class="text-h6 font-weight-medium text-white"
      subtitle-class="text-caption text-grey-lighten-2"
    />

    <v-main class="bg-grey-lighten-5">
      <v-container fluid class="pa-4">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-8">
          <v-progress-circular
            indeterminate
            color="blue-grey-darken-1"
            size="64"
          ></v-progress-circular>
          <p class="text-h6 mt-4">Loading report data...</p>
        </div>

        <!-- Error State -->
        <v-alert v-if="error" type="error" class="mb-4" closable @click:close="clearError">
          {{ error }}
        </v-alert>

        <v-row v-if="!isLoading">
          <!-- Main Content Area -->
          <v-col cols="12" md="8" lg="9">
            <!-- Daily Summary Card -->
            <StatsCard
              title="Daily Summary"
              :stats="summaryStats"
              title-icon="mdi-chart-box-outline"
              :date-text="currentDate"
              stat-number-class="text-h2 font-weight-bold text-grey-darken-2 mb-1"
              elevation="1"
              class="mb-4"
            />

            <!-- Export Button with Dropdown -->
            <v-card elevation="1" class="mb-4">
              <v-card-text class="d-flex ga-3">
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      color="blue-grey-darken-1"
                      prepend-icon="mdi-file-export"
                      append-icon="mdi-chevron-down"
                      variant="outlined"
                      v-bind="props"
                      :disabled="isLoading"
                    >
                      Export Report
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="exportPDF">
                      <template v-slot:prepend>
                        <v-icon color="red-darken-1">mdi-file-pdf-box</v-icon>
                      </template>
                      <v-list-item-title>Export as PDF</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="exportExcel">
                      <template v-slot:prepend>
                        <v-icon color="green-darken-1">mdi-microsoft-excel</v-icon>
                      </template>
                      <v-list-item-title>Export as Excel</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>

                <v-btn
                  color="blue-grey-lighten-1"
                  prepend-icon="mdi-refresh"
                  variant="outlined"
                  :loading="isLoading"
                  @click="refreshData"
                >
                  Refresh
                </v-btn>
              </v-card-text>
            </v-card>

            <!-- No Data State -->
            <v-card
              v-if="filteredDepartments.length === 0 && !isLoading"
              elevation="1"
              class="text-center py-8"
            >
              <v-card-text>
                <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-inbox-outline</v-icon>
                <p class="text-h6 text-grey-darken-1">No data available for selected date</p>
                <p class="text-body-2 text-grey">
                  Try selecting a different date or refreshing the data.
                </p>
              </v-card-text>
            </v-card>

            <!-- Department Sections -->
            <DepartmentCard
              v-for="department in filteredDepartments"
              :key="department.name"
              :department="department"
              elevation="0"
              class="mb-3"
            />
          </v-col>

          <!-- Right Sidebar -->
          <v-col cols="12" md="4" lg="3">
            <!-- Report Date Card -->
            <FilterCard
              title="Report Date"
              type="date"
              icon="mdi-calendar"
              v-model="selectedDate"
              :show-actions="false"
              elevation="1"
              @update:model-value="updateData"
            />

            <!-- Department Filter Card -->
            <FilterCard
              title="Department Filter"
              type="checkbox"
              icon="mdi-filter-variant"
              :options="availableDepartments"
              v-model:selected-options="selectedDepartments"
              :actions="filterActions"
              elevation="1"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useMealStore } from '../stores/mealStore'
import { useDepartments } from '@/composables/useDepartments'
import AppHeader from '@/components/AppHeader.vue'
import StatsCard from '@/components/StatsCard.vue'
import DepartmentCard from '@/components/DepartmentCard.vue'
import FilterCard from '@/components/FilterCard.vue'

const mealStore = useMealStore()
const { availableDepartments, selectedDepartments, fetchDepartments, selectAll, deselectAll } =
  useDepartments()
interface Staff {
  id: number
  name: string
  entraadname: string
  portions: number
  checkinTime?: string
}

interface Department {
  name: string
  deptname: string
  entity: string
  staff: Staff[]
  totalPortions: number
  staff_count: number
  record_count: number
}

interface ReportData {
  date: string
  total_record_count: number
  total_unique_staff: number
  departments: any[]
}

// Reactive data
const reportData = ref<ReportData | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const selectedDate = ref(new Date().toISOString().split('T')[0]) // Today's date in YYYY-MM-DD format

// Computed properties
const currentDate = computed(() => {
  const date = new Date(selectedDate.value)
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const summaryStats = computed(() => [
  {
    label: 'Total Staff',
    value: reportData.value?.total_unique_staff || 0,
  },
  {
    label: 'Total Portions',
    value: reportData.value?.total_record_count || 0,
  },
])

// Transform backend data to frontend format
const transformedDepartments = computed((): Department[] => {
  if (!reportData.value?.departments) return []

  return reportData.value.departments
    .map((dept) => {
      // Transform staff records
      const staff: Staff[] = []
      let staffIdCounter = 1

      if (dept.records && Array.isArray(dept.records)) {
        dept.records.forEach((employeeRecord: any) => {
          if (employeeRecord.records && employeeRecord.records.length > 0) {
            // Calculate total portions for this employee on this date
            const totalPortions = employeeRecord.records.reduce(
              (sum: number, record: any) => sum + (record.count || 0),
              0,
            )

            if (totalPortions > 0) {
              staff.push({
                id: staffIdCounter++,
                name: employeeRecord.fullname || 'Unknown',
                entraadname: employeeRecord.entraadname || 'unknown',
                portions: totalPortions,
                checkinTime: employeeRecord.records[0]?.datetime || 'N/A', // assuming backend gives `time`
              })
            }
          }
        })
      }

      return {
        name: dept.deptname || 'Unknown Department',
        deptname: dept.deptname,
        entity: dept.entity,
        staff,
        totalPortions: staff.reduce((sum, s) => sum + s.portions, 0),
        staff_count: dept.staff_count || staff.length,
        record_count: dept.record_count || 0,
      }
    })
    .filter((dept) => dept.staff.length > 0)
})

const filteredDepartments = computed(() => {
  if (selectedDepartments.value.length === 0) {
    return transformedDepartments.value
  }
  return transformedDepartments.value.filter((dept) =>
    selectedDepartments.value.includes(dept.deptname),
  )
})

const filterActions = computed(() => [
  {
    label: 'Select All',
    action: selectAll,
    color: 'blue-grey-darken-1',
    variant: 'elevated',
    block: true,
  },
  {
    label: 'Deselect All',
    action: deselectAll,
    color: 'grey',
    variant: 'outlined',
    block: true,
  },
])

// Methods
const fetchReportData = async () => {
  isLoading.value = true
  error.value = null

  try {
    console.log('Fetching report data for date:', selectedDate.value)
    const data = await mealStore.getReportDataByDate(selectedDate.value)
    console.log(data)

    if (data) {
      reportData.value = data
    } else {
      reportData.value = {
        date: selectedDate.value,
        total_record_count: 0,
        total_unique_staff: 0,
        departments: [],
      }
    }
  } catch (err) {
    console.error('Error fetching report data:', err)
    error.value = err instanceof Error ? err.message : 'Failed to fetch report data'
    reportData.value = null
  } finally {
    isLoading.value = false
  }
}

const exportPDF = async () => {
  try {
    console.log('Exporting PDF report...')
    // You can implement PDF export here or call mealStore method
    await mealStore.exportReportPDF(selectedDate.value, selectedDepartments.value)
  } catch (err) {
    console.error('Error exporting PDF:', err)
    error.value = 'Failed to export PDF'
  }
}

const exportExcel = async () => {
  try {
    console.log('Exporting Excel report...')
    // You can implement Excel export here or call mealStore method
    await mealStore.exportReportExcel(selectedDate.value, selectedDepartments.value)
  } catch (err) {
    console.error('Error exporting Excel:', err)
    error.value = 'Failed to export Excel'
  }
}

const refreshData = async () => {
  console.log('Refreshing data...')
  await fetchReportData()
}

const updateData = async () => {
  console.log('Updating data for date:', selectedDate.value)
  await fetchReportData()
}

const clearError = () => {
  error.value = null
}

// Watch for date changes
watch(selectedDate, () => {
  updateData()
})
// Initialize on mount
onMounted(async () => {
  await fetchDepartments()
  await fetchReportData()
  // Auto-select all departments after data is loaded
  selectedDepartments.value = [...availableDepartments.value]
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background-color: #fafafa;
}
</style>
