<template>
  <div class="admin-dashboard">
    <!-- Header -->
    <AppHeader
      title="Meal Check Report Dashboard"
      subtitle="Staff Meal Portion Tracking System"
      color="blue-grey-darken-3"
      :dark="true"
      :height="100"
      :show-logo="true"
      icon="mdi-food"
      :icon-size="32"
      header-class="px-6"
      justify="center"
      title-class="text-h5 font-weight-medium"
      subtitle-class="text-body-2 mb-0 text-grey-lighten-2"
    />

    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="pa-4">
        <v-row>
          <!-- Main Content Area -->
          <v-col cols="12" md="8" lg="9">
            <!-- Daily Summary Card -->
            <StatsCard
              title="Daily Summary"
              :stats="summaryStats"
              title-icon="mdi-chart-box"
              :date-text="currentDate"
              stat-number-class="text-h2 font-weight-bold text-blue-grey-darken-2 mb-2"
              elevation="1"
            />

            <!-- Action Buttons -->
            <ActionButtons :buttons="actionButtons" />

            <!-- Department Sections -->
            <DepartmentCard
              v-for="department in filteredDepartments"
              :key="department.name"
              :department="department"
              elevation="1"
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
              @update:model-value="updateData"
            />

            <!-- Department Filter Card -->
            <FilterCard
              title="Department Filter"
              type="checkbox"
              icon="mdi-filter"
              :options="allDepartments"
              v-model:selected-options="selectedDepartments"
              :actions="filterActions"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMealStore } from '../stores/mealStore'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AppHeader from '@/components/AppHeader.vue'
import StatsCard from '@/components/StatsCard.vue'
import ActionButtons from '@/components/ActionButtons.vue'
import DepartmentCard from '@/components/DepartmentCard.vue'
import FilterCard from '@/components/FilterCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const mealStore = useMealStore()

interface Staff {
  id: number
  name: string
  portions: number
}

interface Department {
  name: string
  staff: Staff[]
  totalPortions: number
}

// Reactive data
const currentDate = ref('July 09, 2025')
const selectedDate = ref('2025-07-09')
const selectedDepartments = ref<string[]>([])

// All departments from the image
const allDepartments = [
  'Chemical & Environment',
  'Control & Instrumentation',
  'Electrical Maintenance',
  'Project & Engineering',
  'Health Safety & Environment',
  'Human Capital Management/Corporate Communications',
  'Information Technology',
  'Materials Management',
  'Mechanical Maintenance',
  'O&E/Fuel Handling',
  'O&E/Operation',
  'Purchasing',
  'Security',
  'Support Services',
]

// Sample data matching the image
const departments = ref<Department[]>([
  {
    name: 'Chemical & Environment',
    totalPortions: 28,
    staff: [
      { id: 1, name: 'John Smith', portions: 3 },
      { id: 2, name: 'Sarah Johnson', portions: 2 },
      { id: 3, name: 'Michael Chen', portions: 4 },
      { id: 4, name: 'Lisa Wong', portions: 1 },
      { id: 5, name: 'David Miller', portions: 3 },
      { id: 6, name: 'Emma Davis', portions: 2 },
      { id: 7, name: 'Robert Taylor', portions: 4 },
      { id: 8, name: 'Amanda Wilson', portions: 3 },
      { id: 9, name: 'Kevin Brown', portions: 2 },
      { id: 10, name: 'Jennifer Lee', portions: 4 },
    ],
  },
  {
    name: 'Electrical Maintenance',
    totalPortions: 35,
    staff: [
      { id: 11, name: 'Mark Johnson', portions: 5 },
      { id: 12, name: 'Rachel Green', portions: 3 },
      { id: 13, name: 'Tom Wilson', portions: 4 },
      { id: 14, name: 'Amy Chen', portions: 2 },
      { id: 15, name: 'Steve Miller', portions: 6 },
      { id: 16, name: 'Linda Davis', portions: 3 },
      { id: 17, name: 'Chris Taylor', portions: 4 },
      { id: 18, name: 'Maria Garcia', portions: 2 },
      { id: 19, name: 'Paul Brown', portions: 3 },
      { id: 20, name: 'Susan Lee', portions: 3 },
    ],
  },
])

// Computed properties for components
const summaryStats = computed(() => [
  { label: 'Total Staff', value: mealStore.totalStaffToday },
  { label: 'Total Portions', value: mealStore.totalPortionsToday },
])

const actionButtons = computed(() => [
  {
    label: 'Export Report',
    color: 'blue-grey-darken-2',
    action: exportReport,
    icon: 'mdi-file-export',
    class: 'mr-3',
  },
  {
    label: 'Refresh',
    color: 'blue-grey-lighten-1',
    action: refreshData,
    icon: 'mdi-refresh',
  },
  {
    label: 'Logout',
    color: 'red-darken-1',
    action: logout,
    icon: 'mdi-logout',
  },
])

const filterActions = computed(() => [
  {
    label: 'Select All',
    action: selectAll,
    color: 'blue-grey-darken-2',
  },
  {
    label: 'Deselect All',
    action: deselectAll,
    color: 'blue-grey-lighten-1',
  },
])

const filteredDepartments = computed(() => {
  if (selectedDepartments.value.length === 0) {
    return departments.value
  }
  return departments.value.filter((dept) => selectedDepartments.value.includes(dept.name))
})

// Methods
const exportReport = () => {
  console.log('Exporting report...')
}

const refreshData = async () => {
  console.log('Refreshing data...')
  await mealStore.initialize()
}

const updateData = async () => {
  console.log('Updating data for date:', selectedDate.value)
  // You can implement date-specific filtering here
  await mealStore.initialize()
}

const selectAll = () => {
  selectedDepartments.value = [...allDepartments]
}

const deselectAll = () => {
  selectedDepartments.value = []
}

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

// Initialize with all departments selected and load data
onMounted(async () => {
  selectedDepartments.value = [...allDepartments]
  await mealStore.initialize()
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
}
</style>
