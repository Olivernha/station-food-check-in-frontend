<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <div class="text-center w-100 pa-6 step-container">
      <v-icon size="80" color="success" class="mb-6 bounce-in user-icon">
        mdi-account-check
      </v-icon>

      <h1 class="text-h4 font-weight-bold mb-3 fade-in-up greeting-text">Hello, {{ userName }}</h1>

      <div class="subtitle-container mb-8 fade-in-up subtitle-text">
        <p class="text-h6 text-grey mb-2">Ready to collect your meal?</p>

        <!-- Today's Collection Summary -->
        <div v-if="todaysCollections > 0" class="collection-status">
          <v-chip
            color="success"
            variant="tonal"
            size="large"
            prepend-icon="mdi-check-circle"
            class="collection-chip"
          >
            <span class="chip-text">
              You have collected {{ todaysCollections }} portion{{
                todaysCollections > 1 ? 's' : ''
              }}
              today
            </span>
          </v-chip>
        </div>

        <!-- Loading state for meal count -->
        <div v-else-if="mealCountLoading" class="collection-status">
          <v-chip
            color="grey"
            variant="tonal"
            size="large"
            prepend-icon="mdi-loading"
            class="collection-chip loading-chip"
          >
            <v-icon class="rotating">mdi-loading</v-icon>
            Loading your meal history...
          </v-chip>
        </div>

        <!-- Error state -->
        <div v-else-if="mealCountError" class="collection-status">
          <v-chip
            color="warning"
            variant="tonal"
            size="large"
            prepend-icon="mdi-alert-circle"
            class="collection-chip"
            @click="refreshMealCount"
          >
            Failed to load history. Tap to retry.
          </v-chip>
        </div>
      </div>

      <v-btn
        color="success"
        size="x-large"
        block
        rounded="xl"
        class="py-4 fade-in-up pulse-hover collect-btn"
        :loading="isLoading"
        :disabled="isLoading"
        @click="$emit('collectMeal')"
      >
        <v-icon start size="24">mdi-food</v-icon>
        {{ isLoading ? 'Processing...' : 'Collect Meal' }}
      </v-btn>

      <!-- History Button -->
      <v-btn
        color="info"
        variant="tonal"
        block
        class="mt-4 fade-in-up history-btn"
        rounded="xl"
        @click="goToHistory"
        size="large"
      >
        <v-icon start>mdi-history</v-icon>
        View Meal History
      </v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useMealCount } from '../composables/useMealCount'

interface Props {
  userName: string
  isLoading: boolean
}

defineProps<Props>()
defineEmits<{
  collectMeal: []
}>()

const router = useRouter()

// Use the meal count composable
const {
  todaysCollections,
  isLoading: mealCountLoading,
  error: mealCountError,
  refreshMealCount,
} = useMealCount()

const goToHistory = () => {
  router.push('/history')
}
</script>

<style scoped>
.fill-height {
  min-height: calc(100vh - 160px);
}

.step-container {
  animation: fadeInScale 0.8s ease-out;
  max-width: 500px;
  margin: 0 auto;
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.bounce-in {
  animation: bounceIn 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-10deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotate(5deg);
  }
  70% {
    transform: scale(0.9) rotate(-2deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
}

.greeting-text {
  animation-delay: 0.3s;
}

.subtitle-text {
  animation-delay: 0.5s;
}

.subtitle-container {
  position: relative;
}

.collection-status,
.mt-4 {
  margin-top: 8px;
  animation: slideInFromBottom 0.6s ease-out;
  animation-delay: 0.8s;
  animation-fill-mode: both;
}

/* Default chip styling (desktop) */
.collection-chip {
  font-weight: 600 !important;
  font-size: 1rem !important;
  letter-spacing: 0.5px;
  padding: 12px 20px !important;
  height: auto !important;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

/* Mobile-specific styling */
@media (max-width: 600px) {
  .collection-chip {
    font-size: 0.9rem !important; /* smaller font */
    padding: 6px 12px !important; /* smaller padding */
    line-height: 1.3;
    white-space: normal;
    word-wrap: break-word;
    text-align: center;
  }

  .collection-chip v-icon {
    font-size: 16px !important; /* smaller icon */
  }
}

.collection-chip.loading-chip {
  cursor: default;
}

.collection-chip[color='warning'] {
  cursor: pointer;
  transition: all 0.2s ease;
}

.collection-chip[color='warning']:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 16px rgba(255, 193, 7, 0.3);
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideInFromBottom {
  0% {
    opacity: 0;
    transform: translateY(15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.collect-btn {
  animation-delay: 0.7s;
}

.history-btn {
  animation-delay: 0.9s;
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

.pulse-hover {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.pulse-hover:hover:not(:disabled) {
  transform: scale(1.03) translateY(-2px);
  box-shadow: 0 12px 24px rgba(76, 175, 80, 0.3);
}

.user-icon {
  filter: drop-shadow(0 4px 8px rgba(76, 175, 80, 0.3));
}
</style>
