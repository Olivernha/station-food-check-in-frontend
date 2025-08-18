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
        <v-row>
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
                  @click="refreshData"
                >
                  Refresh
                </v-btn>
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
              :options="allDepartments"
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
import { ref, computed, onMounted } from 'vue'
import { useMealStore } from '../stores/mealStore'

import AppHeader from '@/components/AppHeader.vue'
import StatsCard from '@/components/StatsCard.vue'
import DepartmentCard from '@/components/DepartmentCard.vue'
import FilterCard from '@/components/FilterCard.vue'

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
  'Human Capital Management/Corporate Communication',
  'Information Technology',
  'Materials Management',
  'Mechanical Maintenance',
  'O&G/Fuel Handling',
  'O&G/Operation',
  'Purchasing',
  'Security',
  'Support Services',
]

// Sample data matching the image exactly
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
      { id: 11, name: 'James Rodriguez', portions: 4 },
      { id: 12, name: 'Rachel Green', portions: 3 },
      { id: 13, name: 'Tom Wilson', portions: 2 },
      { id: 14, name: 'Amy Chen', portions: 4 },
      { id: 15, name: 'Steve Miller', portions: 3 },
      { id: 16, name: 'Linda Davis', portions: 2 },
      { id: 17, name: 'Chris Taylor', portions: 4 },
      { id: 18, name: 'Maria Garcia', portions: 3 },
      { id: 19, name: 'Paul Brown', portions: 2 },
      { id: 20, name: 'Susan Lee', portions: 4 },
      { id: 21, name: 'Brandon Walker', portions: 4 },
    ],
  },
])

// Computed properties
const summaryStats = computed(() => [
  { label: 'Total Staff', value: 36 },
  { label: 'Total Portions', value: 103 },
])

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

const filteredDepartments = computed(() => {
  if (selectedDepartments.value.length === 0) {
    return departments.value
  }
  return departments.value.filter((dept) => selectedDepartments.value.includes(dept.name))
})

// Methods

const exportPDF = async () => {
  console.log('Exporting PDF report...')
  await mealStore.exportReportPDF(selectedDate.value, selectedDepartments.value)
}

const exportExcel = async () => {
  console.log('Exporting Excel report...')
  await mealStore.exportReportExcel(selectedDate.value, selectedDepartments.value)
}

const refreshData = async () => {
  console.log('Refreshing data...')
  await mealStore.initialize()
}

const updateData = async () => {
  console.log('Updating data for date:', selectedDate.value)
  await mealStore.initialize()
}

const selectAll = () => {
  selectedDepartments.value = [...allDepartments]
}

const deselectAll = () => {
  selectedDepartments.value = []
}

onMounted(async () => {
  selectedDepartments.value = [...allDepartments]
  await mealStore.initialize()
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background-color: #fafafa;
}
</style>
