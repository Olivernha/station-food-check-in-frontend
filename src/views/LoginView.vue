<template>
  <v-app>
    <!-- Modern Header -->
    <AppHeader
      title="Meal Check-In"
      :subtitle="currentDate"
      color="white"
      :dark="false"
      :height="120"
      :show-logo="true"
      :logo-src="logo"
      logo-alt="Logo"
      :logo-size="60"
      title-class="text-h4 font-weight-bold text-grey-darken-4"
      subtitle-class="text-body-2 text-grey-darken-2 ma-0 font-weight-medium"
    />

    <v-main class="bg-grey-lighten-4">
      <transition name="slide-in-left" mode="out-in">
        <v-container class="fill-height d-flex align-center justify-center">
          <div class="text-center w-100 pa-6 step-content">
            <v-icon size="120" color="primary" class="mb-8 bounce-in">mdi-account-circle</v-icon>
            <h1 class="text-h2 font-weight-bold mb-6 slide-up">Welcome</h1>
            <p class="text-h5 text-grey mb-12 slide-up delay-1">Please sign in to continue</p>
            <v-btn
              color="primary"
              size="x-large"
              block
              rounded="xl"
              class="py-6 slide-up delay-2"
              style="max-width: 400px; margin: 0 auto"
              :loading="isLoading"
              :disabled="isLoading"
              @click="login"
            >
              <v-icon start size="32">mdi-login</v-icon>
              <span class="text-h6">{{ isLoading ? 'Signing In...' : 'Sign In' }}</span>
            </v-btn>
          </div>
        </v-container>
      </transition>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import logo from '@/assets/img/tuaslogo.png'
import AppHeader from '../components/AppHeader.vue'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(false)

const login = async () => {
  isLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate loading
    authStore.login()
    // Redirect to main route after login
    router.push('/')
  } finally {
    isLoading.value = false
  }
}
const currentDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})
</script>

<style scoped>
.fill-height {
  min-height: calc(100vh - 120px);
}

/* Step Content Animations */
.step-content {
  animation: stepContentEnter 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes stepContentEnter {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Individual Element Animations */
.bounce-in {
  animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(-20px);
  }
  50% {
    opacity: 1;
    transform: scale(1.05) translateY(-5px);
  }
  70% {
    transform: scale(0.95) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.slide-up {
  animation: slideUp 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation-fill-mode: both;
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animation Delays */
.delay-1 {
  animation-delay: 0.1s;
}

.delay-2 {
  animation-delay: 0.2s;
}

/* Slide In Left Animation */
.slide-in-left-enter-active,
.slide-in-left-leave-active {
  transition: all 0.4s ease-in-out;
}

.slide-in-left-enter-from {
  opacity: 0;
  transform: translateX(-100px);
}

.slide-in-left-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

/* Button hover effects */
.v-btn {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
}

.v-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.v-btn:active {
  transform: translateY(0);
}
</style>
