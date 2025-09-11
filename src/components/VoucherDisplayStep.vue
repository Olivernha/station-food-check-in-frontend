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

.voucher-header {
  animation: voucherSlide 0.8s ease-out;
  border-radius: 16px;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.voucher-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes voucherSlide {
  0% {
    opacity: 0;
    transform: translateY(-40px) rotateX(-15deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotateX(0deg);
  }
}

.bounce-in {
  animation: bounceIn 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-20deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotate(10deg);
  }
  70% {
    transform: scale(0.9) rotate(-5deg);
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

.divider-animate {
  animation: dividerExpand 0.8s ease-out;
  animation-delay: 0.9s;
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

.detail-row {
  animation: slideInLeft 0.6s ease-out forwards;
  opacity: 0;
  transform: translateX(-30px);
}

@keyframes slideInLeft {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.detail-label {
  transition: color 0.3s ease;
}

.detail-value {
  transition: all 0.3s ease;
}

.detail-row:hover .detail-value {
  transform: scale(1.05);
  color: rgb(var(--v-theme-primary));
}



@keyframes iconPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
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

.voucher-icon {
  filter: drop-shadow(0 4px 8px rgba(255, 255, 255, 0.3));
}

</style>
