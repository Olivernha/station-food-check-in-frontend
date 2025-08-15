<template>
  <v-app>
    <!-- Modern Header -->
    <AppHeader
      title="Meal Check-In"
      :subtitle="currentDate"
      color="white"
      :dark="false"
      :height="80"
      :show-logo="true"
      :logo-src="logo"
      logo-alt="Logo"
      :logo-size="40"
      title-class="text-h5 font-weight-semibold text-grey-darken-3"
      subtitle-class="text-body-2 text-grey ma-0"
    />

    <v-main class="bg-grey-lighten-4">
      <!-- Step 1: Login -->
      <v-container v-if="!isLoggedIn" class="fill-height d-flex align-center justify-center">
        <div class="text-center w-100 pa-6">
          <v-icon size="80" color="primary" class="mb-6">mdi-account-circle</v-icon>
          <h1 class="text-h3 font-weight-bold mb-4">Welcome</h1>
          <p class="text-h6 text-grey mb-8">Please sign in to continue</p>
          <v-btn
            color="primary"
            size="x-large"
            block
            rounded="xl"
            class="py-4"
            :loading="isLoading"
            :disabled="isLoading"
            @click="login"
          >
            <v-icon start size="24">mdi-login</v-icon>
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </v-btn>
        </div>
      </v-container>

      <!-- Step 1: Ready to Collect -->
      <v-container
        v-if="isLoggedIn && currentStep === 2"
        class="fill-height d-flex align-center justify-center"
      >
        <div class="text-center w-100 pa-6">
          <v-icon size="80" color="success" class="mb-6">mdi-account-check</v-icon>
          <h1 class="text-h3 font-weight-bold mb-2">Hello, {{ userName }}</h1>
          <p class="text-h6 text-grey mb-8">Ready to collect your meal?</p>
          <v-btn
            color="success"
            size="x-large"
            block
            rounded="xl"
            class="py-4"
            :loading="isLoading"
            :disabled="isLoading"
            @click="collectMeal"
          >
            <v-icon start size="24">mdi-food</v-icon>
            {{ isLoading ? 'Processing...' : 'Collect Meal' }}
          </v-btn>
        </div>
      </v-container>

      <!-- Step 3: During Meal Collection -->
      <v-container
        v-if="isLoggedIn && currentStep === 3"
        class="fill-height d-flex align-center justify-center"
      >
        <div class="text-center w-100 pa-6">
          <v-icon size="80" color="primary" class="mb-6">mdi-counter</v-icon>
          <h1 class="text-h3 font-weight-bold mb-2">Select Portions</h1>
          <p class="text-h6 text-grey mb-8">How many portions are you collecting?</p>

          <div class="d-flex align-center justify-center my-12">
            <v-btn
              icon="mdi-minus"
              size="x-large"
              color="grey-lighten-1"
              class="me-6"
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
              <div class="text-h6 text-grey text-uppercase mt-2">
                portion{{ portionsToCollect > 1 ? 's' : '' }}
              </div>
            </div>

            <v-btn
              icon="mdi-plus"
              size="x-large"
              color="grey-lighten-1"
              class="ms-6"
              @click="increasePortion"
              :disabled="portionsToCollect >= 10000 || isLoading"
            />
          </div>

          <v-btn
            color="success"
            size="x-large"
            block
            rounded="xl"
            class="py-4"
            :loading="isLoading"
            :disabled="isLoading"
            @click="submitCollection"
          >
            <v-icon start size="24">mdi-check</v-icon>
            {{ isLoading ? 'Confirming...' : 'Confirm' }}
          </v-btn>
        </div>
      </v-container>

      <!-- Step 4: Show to Vendor -->
      <v-container
        v-if="isLoggedIn && currentStep === 4"
        class="fill-height d-flex align-center justify-center"
      >
        <div class="text-center w-100 pa-6">
          <div class="bg-success pa-3">
            <v-icon size="60" color="white" class="mb-4">mdi-food</v-icon>
            <h1 class="text-h4 font-weight-bold mb-6">Meal Collection Voucher</h1>
          </div>

          <!-- Portion Display -->
          <div class="text-center mb-8">
            <div
              class="text-h1 font-weight-bold text-success mb-2 ma-5"
              style="font-size: 5rem !important"
            >
              {{ totalPortions }}
            </div>
            <div class="text-h4 font-weight-medium text-grey-darken-1">
              MEAL{{ totalPortions > 1 ? 'S' : '' }}
            </div>
          </div>

          <v-divider class="mb-6"></v-divider>

          <!-- User Details -->
          <div class="mb-6">
            <v-row v-for="detail in userDetails" :key="detail.label" class="mb-3">
              <v-col cols="5" class="text-left">
                <span class="text-h6 text-grey">{{ detail.label }}:</span>
              </v-col>
              <v-col cols="7" class="text-right">
                <span class="text-h6 font-weight-medium">{{ detail.value }}</span>
              </v-col>
            </v-row>
          </div>

          <!-- Instruction -->
          <v-alert type="info" variant="tonal" class="mb-8 text-h6" rounded="xl">
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
            class="py-4"
            :loading="isLoading"
            :disabled="isLoading"
            @click="completeCollection"
          >
            <v-icon start size="24">mdi-check-circle</v-icon>
            {{ isLoading ? 'Processing...' : 'Confirm Collection' }}
          </v-btn>
        </div>
      </v-container>

      <!-- Step 5: Final Summary -->
      <v-container
        v-if="isLoggedIn && currentStep === 5"
        class="fill-height d-flex align-center justify-center"
      >
        <div class="text-center w-100 pa-6">
          <v-icon size="80" color="success" class="mb-6">mdi-check-circle</v-icon>
          <h1 class="text-h3 font-weight-bold mb-8">Collection Complete</h1>

          <div class="mb-8">
            <div
              class="text-h1 font-weight-bold text-success mb-4"
              style="font-size: 4rem !important"
            >
              {{ totalPortions }}
            </div>
            <div class="text-h5 text-grey-darken-1 mb-4">
              portion{{ totalPortions > 1 ? 's' : '' }} collected today
            </div>
            <div class="text-h6 text-grey">{{ detailedDateTime }}</div>
          </div>

          <v-btn
            color="grey-darken-1"
            size="x-large"
            block
            rounded="xl"
            class="py-4"
            @click="goHome"
          >
            <v-icon start size="24">mdi-home</v-icon>
            Back to Home
          </v-btn>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

import logo from '@/assets/img/tuaslogo.png'
import AppHeader from '../components/AppHeader.vue'
import { useAuthStore } from '../stores/authStore.ts'

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isAuthenticated)
// State management
const currentStep = ref() // Start at step 2 since user is already authenticated
const portionsToCollect = ref(1)
const totalPortions = ref(0)
const isLoading = ref(false)

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

const login = async () => {
  isLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate loading
    authStore.login()
    currentStep.value = 2
  } finally {
    isLoading.value = false
  }
}

const collectMeal = async () => {
  isLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate loading
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
  try {
    await new Promise((resolve) => setTimeout(resolve, 1200)) // Simulate processing
    totalPortions.value += portionsToCollect.value
    currentStep.value = 4
  } finally {
    isLoading.value = false
  }
}

const completeCollection = async () => {
  isLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate completion
    currentStep.value = 5
  } finally {
    isLoading.value = false
  }
}

const goHome = () => {
  currentStep.value = 2
  portionsToCollect.value = 1
}
</script>

<style scoped>
/* Minimal custom styles - Vuetify handles most styling */
.fill-height {
  min-height: calc(100vh - 80px);
}

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
}

.portion-input :deep(.v-field--focused) {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2) !important;
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
