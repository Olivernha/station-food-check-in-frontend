<template>
  <v-card :elevation="elevation" rounded="lg" color="white" class="mb-3">
    <!-- Department Header -->
    <v-card-title
      class="bg-blue-grey-darken-3 text-white pa-3 d-flex justify-space-between align-center"
    >
      <span class="text-body-1 font-weight-medium">{{ department.name }}</span>
      <div class="text-caption">
        Total: {{ department.totalPortions }} portions | ${{ department.totalPrice.toFixed(2) }}
      </div>
    </v-card-title>

    <!-- Staff List -->
    <v-card-text class="pa-0">
      <v-list density="compact" class="py-0">
        <template v-for="(staff, index) in department.staff" :key="staff.id">
          <v-list-item
            class="px-4 py-2"
            :class="{ 'border-b': index < department.staff.length - 1 }"
          >
            <v-list-item-title class="text-body-2 text-grey-darken-2 font-weight-regular">
              {{ staff.name }}
            </v-list-item-title>
            <v-list-item-subtitle v-if="staff.checkinTime" class="text-caption text-grey">
              First Check-in-meal: {{ formatCheckinDateTime(staff.checkinTime) }}
            </v-list-item-subtitle>

            <template v-slot:append>
              <div class="d-flex align-center ga-2">
                <!-- Expand/Collapse Button -->
                <v-btn
                  v-if="staff.records && staff.records.length > 0"
                  icon
                  variant="text"
                  size="small"
                  @click="toggleStaffExpand(staff.id)"
                >
                  <v-icon size="16">
                    {{ expandedStaff.includes(staff.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                  </v-icon>
                </v-btn>

                <v-chip
                  :color="getPortionChipColor(staff.portions)"
                  :text-color="getPortionTextColor(staff.portions)"
                  size="small"
                  class="font-weight-medium"
                  variant="flat"
                >
                  {{ staff.portions }} portion{{ staff.portions > 1 ? 's' : '' }}
                  (${{ staff.price.toFixed(2) }})
                </v-chip>
              </div>
            </template>
          </v-list-item>

          <!-- Collapsible Records Section -->
          <v-expand-transition>
            <div v-show="expandedStaff.includes(staff.id)" class="ml-8 mr-4 mb-2">
              <v-card variant="outlined" rounded="md" class="mb-2">
                <v-card-text class="pa-3">
                  <div class="text-caption font-weight-bold text-grey-darken-1 mb-3">
                    Individual Meal Portions ({{ staff.records?.length || 0 }} total):
                  </div>

                  <!-- Individual Records List -->
                  <div class="records-container">
                    <v-card
                      v-for="(record, recordIndex) in staff.records"
                      :key="recordIndex"
                      variant="flat"
                      rounded="md"
                      class="ma-1 pa-2 record-item"
                      color="blue-grey-lighten-5"
                    >
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <div class="text-caption text-grey">
                            {{ formatDateTime(record.datetime) }}
                          </div>
                        </div>
                        <v-chip
                          size="x-small"
                          color="green-lighten-1"
                          text-color="green-darken-3"
                          variant="flat"
                        >
                          {{ record.meal_count }} portion{{ record.meal_count > 1 ? 's' : '' }} (${{ record.price.toFixed(2) }})
                        </v-chip>
                      </div>
                    </v-card>
                  </div>

                  <!-- Summary Stats -->
                  <v-divider class="my-3"></v-divider>
                  <div class="d-flex justify-space-between text-body-2 font-weight-medium">
                    <span>Total Portions:</span>
                    <span>{{ staff.portions }}</span>
                  </div>
                  <div class="d-flex justify-space-between text-body-2 font-weight-medium">
                    <span>Total Price:</span>
                    <span>${{ staff.price.toFixed(2) }}</span>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-expand-transition>
        </template>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface MealRecord {
  datetime: string
  meal_count: number
  price: number
}

interface Staff {
  id: number
  name: string
  portions: number
  price: number
  checkinTime?: string
  records?: MealRecord[] // Array of meal record objects
}

interface Department {
  name: string
  staff: Staff[]
  totalPortions: number
  totalPrice: number
}

interface Props {
  department: Department
  elevation?: number | string
}

withDefaults(defineProps<Props>(), {
  elevation: 0
})

// Track expanded staff
const expandedStaff = ref<number[]>([])

// Toggle staff expansion
const toggleStaffExpand = (staffId: number) => {
  const index = expandedStaff.value.indexOf(staffId)
  if (index === -1) {
    expandedStaff.value.push(staffId)
  } else {
    expandedStaff.value.splice(index, 1)
  }
}

const getPortionChipColor = (portions: number): string => {
  if (portions >= 4) return 'red-lighten-1'
  if (portions >= 3) return 'orange-lighten-1'
  if (portions >= 2) return 'yellow-darken-2'
  return 'green-lighten-1'
}

const getPortionTextColor = (portions: number): string => {
  if (portions >= 4) return 'white'
  if (portions >= 3) return 'white'
  if (portions >= 2) return 'white'
  return 'green-darken-3'
}

const formatCheckinDateTime = (time?: string): string => {
  if (!time) return 'N/A'
  const date = new Date(time)
  return date.toLocaleString('en-SG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const formatDateTime = (timeString?: string): string => {
  if (!timeString) return 'N/A'
  const date = new Date(timeString)
  return date.toLocaleString('en-SG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
}
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.records-container {
  max-height: 300px;
  overflow-y: auto;
}

.record-item {
  transition: all 0.2s ease;
}

.record-item:hover {
  background-color: rgb(var(--v-theme-blue-grey-lighten-4)) !important;
  transform: translateY(-1px);
}
</style>
