<template>
  <v-app>
    <!-- Modern Header -->
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
      <!-- Step Transitions with Animation -->
      <transition :name="transitionName" mode="out-in">
        <!-- Step 1: Ready to Collect -->
        <v-container
          v-if="currentStep === 2"
          key="ready"
          class="fill-height d-flex align-center justify-center"
        >
          <div class="text-center w-100 pa-6 step-container">
            <v-icon size="80" color="success" class="mb-6 bounce-in">mdi-account-check</v-icon>
            <h1 class="text-h3 font-weight-bold mb-2 fade-in-up">Hello, {{ userName }}</h1>
            <p class="text-h6 text-grey mb-8 fade-in-up">Ready to collect your meal?</p>
            <v-btn
              color="success"
              size="x-large"
              block
              rounded="xl"
              class="py-4 fade-in-up pulse-hover"
              :loading="isLoading"
              :disabled="isLoading"
              @click="collectMeal"
            >
              <v-icon start size="24">mdi-food</v-icon>
              {{ isLoading ? 'Processing...' : 'Collect Meal' }}
            </v-btn>
          </div>
        </v-container>

        <!-- Step 2: During Meal Collection -->
        <v-container
          v-else-if="currentStep === 3"
          key="portions"
          class="fill-height d-flex align-center justify-center"
        >
          <div class="text-center w-100 pa-6 step-container">
            <v-icon size="80" color="primary" class="mb-6 bounce-in">mdi-counter</v-icon>
            <h1 class="text-h3 font-weight-bold mb-2 fade-in-up">Select Portions</h1>
            <p class="text-h6 text-grey mb-8 fade-in-up">How many portions are you collecting?</p>

            <div class="d-flex align-center justify-center my-12 scale-in">
              <v-btn
                icon="mdi-minus"
                size="x-large"
                color="grey-lighten-1"
                class="me-6 button-hover"
                @click="decreasePortion"
                :disabled="portionsToCollect <= 1 || isLoading"
              />

              <div class="text-center mx-6">
                <v-text-field
                  v-model.number="portionsToCollect"
                  type="number"
                  variant="outlined"
                  hide-details
                  class="portion-input"
                />
                <div class="text-h6 text-grey text-uppercase mt-2 fade-in">
                  portion{{ portionsToCollect > 1 ? 's' : '' }}
                </div>
              </div>

              <v-btn
                icon="mdi-plus"
                size="x-large"
                color="grey-lighten-1"
                class="ms-6 button-hover"
                @click="increasePortion"
                :disabled="portionsToCollect >= 10000 || isLoading"
              />
            </div>

            <v-btn
              color="success"
              size="x-large"
              block
              rounded="xl"
              class="py-4 fade-in-up pulse-hover"
              :loading="isLoading"
              :disabled="isLoading"
              @click="submitCollection"
            >
              <v-icon start size="24">mdi-check</v-icon>
              {{ isLoading ? 'Confirming...' : 'Confirm' }}
            </v-btn>
          </div>
        </v-container>

        <!-- Step 3: Show to Vendor -->
        <v-container
          v-else-if="currentStep === 4"
          key="voucher"
          class="fill-height d-flex align-center justify-center"
        >
          <div class="text-center w-100 pa-6 step-container">
            <div class="bg-success pa-3 voucher-header">
              <v-icon size="60" color="white" class="mb-4 bounce-in">mdi-food</v-icon>
              <h1 class="text-h4 font-weight-bold mb-6 text-white fade-in-up">
                Meal Collection Voucher
              </h1>
            </div>

            <!-- Portion Display -->
            <div class="text-center mb-8">
              <div
                class="text-h1 font-weight-bold text-success mb-2 ma-5 number-pop"
                style="font-size: 5rem !important"
              >
                {{ totalPortions }}
              </div>
              <div class="text-h4 font-weight-medium text-grey-darken-1 fade-in-up">
                MEAL{{ totalPortions > 1 ? 'S' : '' }}
              </div>
            </div>

            <v-divider class="mb-6"></v-divider>

            <!-- User Details -->
            <div class="mb-6">
              <v-row
                v-for="(detail, index) in userDetails"
                :key="detail.label"
                class="mb-3 detail-row"
                :style="{ animationDelay: `${index * 100}ms` }"
              >
                <v-col cols="5" class="text-left">
                  <span class="text-h6 text-grey">{{ detail.label }}:</span>
                </v-col>
                <v-col cols="7" class="text-right">
                  <span class="text-h6 font-weight-medium">{{ detail.value }}</span>
                </v-col>
              </v-row>
            </div>

            <!-- Instruction -->
            <v-alert type="info" variant="tonal" class="mb-8 text-h6 alert-slide" rounded="xl">
              <template v-slot:prepend>
                <v-icon size="24">mdi-information</v-icon>
              </template>
              Show this voucher to the food vendor
            </v-alert>

            <v-btn
              color="success"
              size="x-large"
              block
              rounded="xl"
              class="py-4 fade-in-up pulse-hover"
              :loading="isLoading"
              :disabled="isLoading"
              @click="completeCollection"
            >
              <v-icon start size="24">mdi-check-circle</v-icon>
              {{ isLoading ? 'Processing...' : 'Confirm Collection' }}
            </v-btn>
          </div>
        </v-container>

        <!-- Step 4: Final Summary -->
        <v-container
          v-else-if="currentStep === 5"
          key="complete"
          class="fill-height d-flex align-center justify-center"
        >
          <div class="text-center w-100 pa-6 step-container">
            <v-icon size="80" color="success" class="mb-6 bounce-in success-icon"
              >mdi-check-circle</v-icon
            >
            <h1 class="text-h3 font-weight-bold mb-8 fade-in-up">Collection Complete</h1>

            <div class="mb-8">
              <div
                class="text-h1 font-weight-bold text-success mb-4 number-pop"
                style="font-size: 4rem !important"
              >
                {{ totalPortions }}
              </div>
              <div class="text-h5 text-grey-darken-1 mb-4 fade-in-up">
                portion{{ totalPortions > 1 ? 's' : '' }} collected today
              </div>
              <div class="text-h6 text-grey fade-in-up">{{ detailedDateTime }}</div>
            </div>

            <v-btn
              color="grey-darken-1"
              size="x-large"
              block
              rounded="xl"
              class="py-4 fade-in-up button-hover"
              @click="goHome"
            >
              <v-icon start size="24">mdi-home</v-icon>
              Back to Home
            </v-btn>
          </div>
        </v-container>
      </transition>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

import logo from '@/assets/img/tuaslogo.png'
import AppHeader from '../components/AppHeader.vue'
import { useAuthStore } from '../stores/authStore.ts'

const authStore = useAuthStore()

// State management
const currentStep = ref(2)
const portionsToCollect = ref(1)
const totalPortions = ref(0)
const isLoading = ref(false)
const transitionName = ref('slide-right')

// Get user info from auth store
const userName = computed(() => authStore.user?.fullname || 'User')

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

const increasePortion = () => {
  if (portionsToCollect.value < 10000) {
    portionsToCollect.value++
  }
}

const decreasePortion = () => {
  if (portionsToCollect.value > 1) {
    portionsToCollect.value--
  }
}

const submitCollection = async () => {
  isLoading.value = true
  transitionName.value = 'slide-right'
  try {
    await new Promise((resolve) => setTimeout(resolve, 1200))
    totalPortions.value += portionsToCollect.value
    currentStep.value = 4
  } finally {
    isLoading.value = false
  }
}

const completeCollection = async () => {
  isLoading.value = true
  transitionName.value = 'slide-right'
  try {
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
</script>

<style scoped>
/* Fill height adjustment for new header height */
.fill-height {
  min-height: calc(100vh - 160px);
}

/* Step transition animations */
.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(-100px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

/* Element animations */
.step-container {
  animation: fadeInScale 0.6s ease-out;
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.bounce-in {
  animation: bounceIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: 0.2s;
  opacity: 0;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: 0.3s;
  opacity: 0;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.scale-in {
  animation: scaleIn 0.5s ease-out forwards;
  animation-delay: 0.3s;
  transform: scale(0.8);
  opacity: 0;
}

@keyframes scaleIn {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.number-pop {
  animation: numberPop 0.8s ease-out forwards;
  animation-delay: 0.4s;
  transform: scale(0);
}

@keyframes numberPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  60% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.detail-row {
  animation: slideInLeft 0.4s ease-out forwards;
  opacity: 0;
  transform: translateX(-20px);
}

@keyframes slideInLeft {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.alert-slide {
  animation: alertSlide 0.6s ease-out forwards;
  animation-delay: 0.6s;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes alertSlide {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-icon {
  animation: successPulse 1s ease-in-out infinite;
}

@keyframes successPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.voucher-header {
  animation: voucherSlide 0.7s ease-out;
  border-radius: 12px;
  margin-bottom: 2rem;
}

@keyframes voucherSlide {
  0% {
    opacity: 0;
    transform: translateY(-30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Button hover effects */
.pulse-hover {
  transition: all 0.3s ease;
}

.pulse-hover:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.button-hover {
  transition: all 0.3s ease;
}

.button-hover:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Portion input styling */
.portion-input {
  width: 160px !important;
}

.portion-input :deep(.v-field__input) {
  font-size: 5rem !important;
  font-weight: bold !important;
  text-align: center !important;
  color: rgb(var(--v-theme-primary)) !important;
  padding: 20px 0 !important;
}

.portion-input :deep(.v-field) {
  border-radius: 20px !important;
  min-height: 120px !important;
  border: 3px solid rgb(var(--v-theme-primary)) !important;
  transition: all 0.3s ease;
}

.portion-input :deep(.v-field--focused) {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2) !important;
  transform: scale(1.02);
}

/* Hide number input spinner buttons */
.portion-input :deep(input[type='number']::-webkit-outer-spin-button),
.portion-input :deep(input[type='number']::-webkit-inner-spin-button) {
  -webkit-appearance: none !important;
  appearance: none !important;
  margin: 0 !important;
}

.portion-input :deep(input[type='number']) {
  -moz-appearance: textfield !important;
  appearance: textfield !important;
}
</style>
