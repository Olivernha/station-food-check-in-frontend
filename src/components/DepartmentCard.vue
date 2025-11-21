<template>
  <div>
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
                    {{ staff.portions }} portion{{ staff.portions > 1 ? 's' : '' }} (${{
                      staff.price.toFixed(2)
                    }})
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
                          <div class="d-flex align-center ga-2">
                            <v-chip
                              size="x-small"
                              color="green-lighten-1"
                              text-color="green-darken-3"
                              variant="flat"
                            >
                              {{ record.meal_count }} portion{{
                                record.meal_count > 1 ? 's' : ''
                              }}
                              (${{ record.price.toFixed(2) }})
                            </v-chip>
                            <v-btn
                              v-if="authStore.isAdmin && isToday(record.datetime)"
                              icon="mdi-delete"
                              size="x-small"
                              variant="text"
                              color="red-darken-1"
                              @click="confirmDelete(staff, record)"
                            />
                          </div>
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

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="450" persistent :scrim="true">
      <v-card class="delete-alert-card">
        <v-card-title class="d-flex align-center text-h5 pa-6 pb-4">
          <v-icon color="red-darken-2" :size="32" class="mr-3"> mdi-alert-circle </v-icon>
          <span class="text-red-darken-2 font-weight-bold"> Confirm Delete </span>
        </v-card-title>

        <v-card-text class="px-6 pb-2">
          <div class="text-body-1 mb-4">
            Are you sure you want to <strong>remove this meal entry</strong>? This action cannot be
            undone.
          </div>

          <v-alert type="warning" variant="tonal" class="mb-4" prominent dense>
            <div class="text-body-2">
              This will <strong>permanently delete</strong> the meal record from the system.
            </div>
          </v-alert>

          <div v-if="recordToDelete" class="d-flex align-center pa-3 bg-grey-lighten-4 rounded">
            <v-icon color="info" class="mr-3" :size="24">mdi-information</v-icon>
            <div class="text-body-2">
              <div class="font-weight-medium">Entry Details:</div>
              <div class="text-caption text-grey-darken-1">
                {{ recordToDelete.staff.name }} • {{ recordToDelete.record.meal_count }} portion{{
                  recordToDelete.record.meal_count > 1 ? 's' : ''
                }}
                • ${{ recordToDelete.record.price.toFixed(2) }} •
                {{ formatDateTime(recordToDelete.record.datetime) }}
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-btn
            variant="outlined"
            size="large"
            @click="cancelDelete"
            :disabled="isDeleting"
            class="px-6"
          >
            Cancel
          </v-btn>
          <v-spacer />
          <v-btn
            color="red-darken-2"
            variant="elevated"
            size="large"
            @click="handleDelete"
            :loading="isDeleting"
            class="px-6"
          >
            <v-icon start :size="24">mdi-delete</v-icon>
            Delete Entry
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMealStore } from '@/stores/mealStore'
import { useAuthStore } from '@/stores/auth'

const mealStore = useMealStore()
const authStore = useAuthStore()

interface MealRecord {
  id: number
  record_id: string
  datetime: string
  meal_count: number
  price: number
}

interface Staff {
  id: number
  name: string
  entraadname: string
  portions: number
  price: number
  checkinTime?: string
  records?: MealRecord[] // Array of meal record objects
}

interface Department {
  name: string
  deptname: string
  entity: string
  staff: Staff[]
  totalPortions: number
  totalPrice: number
}

interface Props {
  department: Department
  elevation?: number | string
}

withDefaults(defineProps<Props>(), {
  elevation: 0,
})

const emit = defineEmits<{
  'entry-deleted': []
}>()

// Track expanded staff
const expandedStaff = ref<number[]>([])

// Confirmation dialog state
const showDeleteDialog = ref(false)
const recordToDelete = ref<{
  staff: Staff
  record: MealRecord
} | null>(null)
const isDeleting = ref(false)

// Toggle staff expansion
const toggleStaffExpand = (staffId: number) => {
  const index = expandedStaff.value.indexOf(staffId)
  if (index === -1) {
    expandedStaff.value.push(staffId)
  } else {
    expandedStaff.value.splice(index, 1)
  }
}

// Check if record is from today
const isToday = (datetime: string): boolean => {
  const recordDate = new Date(datetime).toISOString().split('T')[0]
  const today = new Date().toISOString().split('T')[0]
  return recordDate === today
}

// Open delete confirmation dialog
const confirmDelete = (staff: Staff, record: MealRecord) => {
  recordToDelete.value = { staff, record }
  showDeleteDialog.value = true
}

// Handle delete action
const handleDelete = async () => {
  if (!recordToDelete.value) return

  isDeleting.value = true
  try {
    const {record}= recordToDelete.value

    await mealStore.deleteMealEntry(record.record_id)

    // Emit event to refresh data
    emit('entry-deleted')

    // Close dialog
    showDeleteDialog.value = false
    recordToDelete.value = null
  } catch (error) {
    console.error('Failed to delete meal entry:', error)
  } finally {
    isDeleting.value = false
  }
}

// Cancel delete
const cancelDelete = () => {
  showDeleteDialog.value = false
  recordToDelete.value = null
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
    hour12: true,
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
    hour12: true,
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

.delete-alert-card {
  animation: alertSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-top: 4px solid rgb(var(--v-theme-red-darken-2));
}

@keyframes alertSlideIn {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.v-alert {
  border-left: 4px solid rgb(var(--v-theme-warning)) !important;
}
</style>
