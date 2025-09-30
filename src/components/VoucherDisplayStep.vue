<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <div class="text-center w-100 pa-6 step-container">
      <!-- Portion Display -->
      <div class="text-center mb-8 portion-showcase">
        <h1 class="text-h3 text-grey-darken-1 font-weight-bold mb-2 fade-in-up">You selected</h1>
        <div
          class="text-h1 font-weight-bold text-success mb-2 ma-5 number-pop"
          style="font-size: 5rem !important"
        >
          {{ totalPortions }}
        </div>
        <div class="text-h4 font-weight-medium text-grey-darken-1 fade-in-up meal-label">
          MEAL{{ totalPortions > 1 ? 'S' : '' }}
        </div>
      </div>

      <!-- Amount Details Card -->
      <v-card
        class="mb-6 amount-details-card fade-in-up"
        rounded="xl"
        elevation="4"
        variant="outlined"
      >
        <v-card-text class="pa-6">
          <div class="text-center">
            <div class="text-subtitle-1 text-grey-darken-2 mb-4">Payment Details</div>
            <div class="d-flex justify-space-between align-center mb-3">
              <span class="text-body-1">Portions:</span>
              <span class="text-h6 font-weight-bold">{{ totalPortions }}</span>
            </div>
            <v-divider class="my-3"></v-divider>
            <div class="d-flex justify-space-between align-center">
              <span class="text-h6 font-weight-bold">Total Amount:</span>
              <span class="text-h4 font-weight-bold text-success total-amount">
                ${{ totalAmount.toFixed(2) }}
              </span>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <v-divider class="mb-6 divider-animate"></v-divider>

      <!-- Action Buttons -->
      <div class="d-flex flex-column ga-4">
        <v-btn
          color="success"
          size="x-large"
          block
          rounded="xl"
          class="py-4 fade-in-up pulse-hover complete-btn"
          :loading="isLoading"
          :disabled="isLoading"
          @click="$emit('complete')"
        >
          <v-icon start size="24">mdi-check-circle</v-icon>
          {{ isLoading ? 'Processing...' : 'Confirm' }}
        </v-btn>

        <v-btn
          color="grey-darken-1"
          variant="outlined"
          size="large"
          block
          rounded="xl"
          class="py-3 fade-in-up cancel-btn"
          :disabled="isLoading"
          @click="$emit('cancel')"
        >
          <v-icon start size="20">mdi-close</v-icon>
          Cancel
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
interface UserDetail {
  label: string
  value: string
}

interface Props {
  totalPortions: number
  totalAmount: number
  userDetails: UserDetail[]
  isLoading: boolean
}

defineProps<Props>()
defineEmits<{
  complete: []
  cancel: []
}>()
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

.fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
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

.number-pop {
  animation: numberPop 1s ease-out forwards;
  animation-delay: 0.5s;
  transform: scale(0);
  position: relative;
}

.number-pop::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120%;
  height: 120%;
  border: 3px solid rgba(76, 175, 80, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  animation: ripple 1.5s ease-out infinite;
  animation-delay: 1s;
}

@keyframes numberPop {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.2) rotate(10deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

.portion-showcase {
  animation: showcaseFloat 4s ease-in-out infinite;
}

@keyframes showcaseFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.meal-label {
  animation-delay: 0.7s;
}

.amount-details-card {
  animation-delay: 0.9s;
  transition: all 0.3s ease;
}

.amount-details-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.total-amount {
  animation: totalPulse 2s ease-in-out infinite;
}

@keyframes totalPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.divider-animate {
  animation: dividerExpand 0.8s ease-out;
  animation-delay: 1.1s;
  transform: scaleX(0);
  transform-origin: center;
}

@keyframes dividerExpand {
  0% {
    transform: scaleX(0);
    opacity: 0;
  }
  100% {
    transform: scaleX(1);
    opacity: 1;
  }
}

.pulse-hover {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.pulse-hover:hover:not(:disabled) {
  transform: scale(1.03) translateY(-3px);
  box-shadow: 0 15px 30px rgba(76, 175, 80, 0.4);
}

.complete-btn {
  animation-delay: 1.4s;
}

.cancel-btn {
  animation-delay: 1.6s;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.cancel-btn:hover:not(:disabled) {
  transform: scale(1.02) translateY(-2px);
  box-shadow: 0 8px 20px rgba(244, 67, 54, 0.3);
}
</style>
