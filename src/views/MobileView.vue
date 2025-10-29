<template>
  <v-app>
    <AppHeader
      title="Meal Check-In"
      :subtitle="currentDate"
      color="white"
      :dark="false"
      :height="100"
      :show-logo="true"
      :logo-src="logo"
      logo-alt="Logo"
      :logo-size="60"
      title-class="text-h4 font-weight-bold text-grey-darken-4"
      subtitle-class="text-body-2 text-grey-darken-2 ma-0 font-weight-medium"
      :show-logout-button="true"
    />

    <v-main class="bg-grey-lighten-4">
      <!-- Offline Status Bar -->
      <OfflineStatusBar />

      <transition :name="transitionName" mode="out-in">
        <ReadyToCollectStep
          v-if="currentStep === 2"
          key="ready"
          :user-name="userName"
          :is-loading="isLoading"
          @collect-meal="collectMeal"
        />

        <PortionSelectionStep
          v-else-if="currentStep === 3"
          key="portions"
          v-model:portions="portionsToCollect"
          :is-loading="isLoading"
          @submit="submitPortionSelection"
          @back="goBackToReady"
        />

        <AmountSelectionStep
          v-else-if="currentStep === 4"
          key="amount"
          :portions="portionsToCollect"
          :is-loading="isLoading"
          @submit="submitAmountSelection"
          @back="goBackToPortions"
        />

        <VoucherDisplayStep
          v-else-if="currentStep === 5"
          key="voucher"
          :total-portions="portionsToCollect"
          :total-amount="totalAmount"
          :user-details="userDetails"
          :is-loading="isLoading"
          @complete="completeCollection"
          @cancel="goBackToAmount"
        />

        <CompletionStep
          v-else-if="currentStep === 6"
          key="complete"
          :current-portion="portionsToCollect"
          :total-amount="totalAmount"
          :detailed-date-time="detailedDateTime"
          @go-home="goHome"
        />
      </transition>
    </v-main>

    <!-- Critical Offline Alert -->
    <OfflineMealAlert
      :show="showOfflineAlert"
      :meal-details="offlineMealDetails"
      @acknowledge="showOfflineAlert = false"
    />

    <!-- Collection Blocked Alert -->
    <BlockedCollectionAlert
      :show="showBlockedAlert"
      :message="blockedMessage"
      @acknowledge="showBlockedAlert = false"
    />

    <!-- Sync success notification -->
    <v-snackbar v-model="showSyncSuccess" :timeout="4000" color="success" location="bottom">
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-cloud-check</v-icon>
        <span>{{ syncSuccessMessage }}</span>
      </div>
    </v-snackbar>

    <!-- Offline submission notification (backup) -->
    <v-snackbar v-model="showOfflineNotification" :timeout="5000" color="warning" location="bottom">
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-cloud-off-outline</v-icon>
        <span>Meal saved locally. Will sync when online.</span>
      </div>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import logo from '@/assets/img/tuaslogo.png'
import AppHeader from '../components/AppHeader.vue'
import ReadyToCollectStep from '../components/ReadyToCollectStep.vue'
import PortionSelectionStep from '../components/PortionSelectionStep.vue'
import AmountSelectionStep from '../components/AmountSelectionStep.vue'
import VoucherDisplayStep from '../components/VoucherDisplayStep.vue'
import CompletionStep from '../components/CompletionStep.vue'
import OfflineMealAlert from '../components/OfflineMealAlert.vue'
import OfflineStatusBar from '../components/OfflineStatusBar.vue'
import BlockedCollectionAlert from '../components/BlockedCollectionAlert.vue'
import { useAuthStore } from '../stores/auth'
import { useMealStore } from '../stores/mealStore'
import { useOfflineStatus } from '@/composables/useOfflineStatus'

const authStore = useAuthStore()
const mealStore = useMealStore()
const { forceRefresh } = useOfflineStatus()

// State management
const currentStep = ref(2)
const portionsToCollect = ref(1)
const totalAmount = ref(8.0)
const isLoading = ref(false)
const transitionName = ref('slide-right')
const showOfflineNotification = ref(false)
const showOfflineAlert = ref(false)
const showSyncSuccess = ref(false)
const showBlockedAlert = ref(false)
const syncSuccessMessage = ref('')
const blockedMessage = ref('')
const offlineMealDetails = ref({
  portions: 1,
  amount: 8.0,
  timestamp: new Date(),
})

// Get user info from auth store
const userName = computed(() => authStore.user?.displayName || 'User')

// Computed properties
const currentDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const detailedDateTime = computed(() => {
  const date = new Date()
  const fullDate = date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  return `${fullDate} at ${time}`
})

const vendorTime = computed(() => {
  const date = new Date()
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
})

const userDetails = computed(() => [
  { label: 'Employee', value: userName.value },
  { label: 'Department', value: authStore.user?.department || 'Operations' },
  { label: 'Date', value: currentDate.value },
  { label: 'Time', value: vendorTime.value },
])

// Methods
const collectMeal = async () => {
  isLoading.value = true
  transitionName.value = 'slide-right'
  try {
    // Check if collection should be blocked before starting
    const blockCheck = await mealStore.checkCollectionBlocked()
    if (blockCheck.blocked) {
      blockedMessage.value = blockCheck.reason || 'Collection blocked due to old unsync data'
      showBlockedAlert.value = true
      return // Don't proceed with collection
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
    currentStep.value = 3
  } finally {
    isLoading.value = false
  }
}

const submitPortionSelection = async () => {
  isLoading.value = true
  transitionName.value = 'slide-right'
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))
    currentStep.value = 4 // Go to amount selection step
  } finally {
    isLoading.value = false
  }
}

const submitAmountSelection = async (data: { totalAmount: number }) => {
  isLoading.value = true
  transitionName.value = 'slide-right'
  try {
    // Store the total amount
    totalAmount.value = data.totalAmount

    await new Promise((resolve) => setTimeout(resolve, 800))
    currentStep.value = 5 // Go to voucher display
  } finally {
    isLoading.value = false
  }
}

const goBackToPortions = () => {
  transitionName.value = 'slide-left'
  currentStep.value = 3
}

const goBackToAmount = () => {
  transitionName.value = 'slide-left'
  currentStep.value = 4
}

const goBackToReady = () => {
  transitionName.value = 'slide-left'
  currentStep.value = 2
}

const completeCollection = async () => {
  isLoading.value = true
  transitionName.value = 'slide-right'
  console.log('authStore', authStore.user)
  try {
    // Save meal collection data using the meal store with total amount only
    const result = await mealStore.saveMealCollection(
      authStore.user?.displayName || 'Unknown User',
      authStore.user?.entraAd || 'unknown',
      authStore.user?.department || 'Operations',
      portionsToCollect.value,
      authStore.user?.entity || 'unknown',
      totalAmount.value,
    )

    // Check if collection was blocked
    if (result.blocked) {
      blockedMessage.value = result.reason || 'Collection blocked due to old unsync data'
      showBlockedAlert.value = true
      return // Don't proceed to completion step
    }

    // Show critical alert if meal was saved offline
    if (!mealStore.isOnline && result.success) {
      offlineMealDetails.value = {
        portions: portionsToCollect.value,
        amount: totalAmount.value,
        timestamp: new Date(),
      }
      showOfflineAlert.value = true
    }

    if (!result.success) {
      console.error('Failed to save meal collection')
      return // Don't proceed if failed
    }

    // Refresh pending meals count after saving
    await forceRefresh()

    await new Promise((resolve) => setTimeout(resolve, 800))
    currentStep.value = 6 // Go to completion step
  } finally {
    isLoading.value = false
  }
}

const goHome = () => {
  transitionName.value = 'slide-left'
  currentStep.value = 2
  // Reset all values
  portionsToCollect.value = 1
  totalAmount.value = 8.0
}

// Handle sync success events
const handleSyncComplete = (event: CustomEvent) => {
  const { syncedCount, totalCount } = event.detail
  if (syncedCount > 0) {
    const mealText = syncedCount === 1 ? 'meal' : 'meals'
    syncSuccessMessage.value = `Successfully synced ${syncedCount} ${mealText}!`
    showSyncSuccess.value = true
  }
}

onMounted(() => {
  window.addEventListener('mealSyncComplete', handleSyncComplete as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('mealSyncComplete', handleSyncComplete as EventListener)
})
</script>

<style scoped>
/* Step transition animations */
/* Slide Right Animation (Forward) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-right-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Slide Left Animation (Backward) */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-left-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
