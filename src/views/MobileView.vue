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
    />

    <v-main class="bg-grey-lighten-4">
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
          @submit="submitCollection"
        />

        <VoucherDisplayStep
          v-else-if="currentStep === 4"
          key="voucher"
          :total-portions="portionsToCollect"
          :user-details="userDetails"
          :is-loading="isLoading"
          @complete="completeCollection"
          @cancel="currentStep = 3"
        />

        <CompletionStep
          v-else-if="currentStep === 5"
          key="complete"
          :currentPortion="portionsToCollect"
          :detailed-date-time="detailedDateTime"
          @go-home="goHome"
        />
      </transition>
    </v-main>
  </v-app>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import logo from '@/assets/img/tuaslogo.png'
import AppHeader from '../components/AppHeader.vue'
import ReadyToCollectStep from '../components/ReadyToCollectStep.vue'
import PortionSelectionStep from '../components/PortionSelectionStep.vue'
import VoucherDisplayStep from '../components/VoucherDisplayStep.vue'
import CompletionStep from '../components/CompletionStep.vue'
import { useAuthStore } from '../stores/auth'
import { useMealStore } from '../stores/mealStore'

const authStore = useAuthStore()
const mealStore = useMealStore()

// State management
const currentStep = ref(2)
const portionsToCollect = ref(1)
const isLoading = ref(false)
const transitionName = ref('slide-right')

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
    await new Promise((resolve) => setTimeout(resolve, 1000))
    currentStep.value = 3
  } finally {
    isLoading.value = false
  }
}

const submitCollection = async () => {
  isLoading.value = true
  transitionName.value = 'slide-right'
  try {
    await new Promise((resolve) => setTimeout(resolve, 1200))
    currentStep.value = 4
  } finally {
    isLoading.value = false
  }
}

const completeCollection = async () => {
  isLoading.value = true
  transitionName.value = 'slide-right'
  console.log('authStore' + authStore.user)
  try {
    // Save meal collection data using the meal store
    const success = await mealStore.saveMealCollection(
      authStore.user?.displayName || 'Unknown User',
      authStore.user?.entraAd || 'unknown',
      authStore.user?.department || 'Operations',
      portionsToCollect.value,
      authStore.user?.entity || 'unknown',
    )

    if (!success) {
      console.error('Failed to save meal collection')
    }

    await new Promise((resolve) => setTimeout(resolve, 800))
    currentStep.value = 5
  } finally {
    isLoading.value = false
  }
}

const goHome = () => {
  transitionName.value = 'slide-left'
  currentStep.value = 2
  portionsToCollect.value = 1
}

// Initialize meal store data when component mounts
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
