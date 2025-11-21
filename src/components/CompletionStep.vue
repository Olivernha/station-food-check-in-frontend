<template>
  <v-container class="fill-height d-flex align-center justify-center px-4">
    <!-- Success Animation -->
    <div class="w-100 max-width-container">
      <!-- Confetti Container -->
      <!-- Instruction Alert -->

      <div class="confetti-container mb-6">
        <v-alert
          type="info"
          variant="tonal"
          class="mb-6 text-h6 alert-slide instruction-alert"
          rounded="xl"
        >
          <template v-slot:prepend>
            <v-icon size="24" class="alert-icon">mdi-information</v-icon>
          </template>
          Show this voucher to the food vendor
        </v-alert>
        <div class="confetti" v-for="i in 100" :key="i" :class="`confetti-${i}`"></div>
      </div>

      <!-- Title -->
      <h1 class="text-h3 font-weight-bold mb-8 completion-title">Collection Complete</h1>

      <!-- Main Content Grid -->
      <div class="content-grid mb-8">
        <!-- Portion Card -->
        <div class="highlight-card portion-card">
          <div class="card-content">
            <div class="portion-number">
              {{ currentPortion }}
            </div>
            <div class="portion-label">portion{{ currentPortion > 1 ? 's' : '' }}</div>
          </div>
        </div>

        <!-- Amount Card -->
        <div class="highlight-card amount-card">
          <div class="card-content">
            <div class="amount-number">${{ formattedTotalAmount }}</div>
            <div class="amount-label">total amount</div>
          </div>
        </div>
      </div>

      <!-- Summary Card -->
      <div class="summary-card mb-8">
        <div class="total-summary">
          <!-- Show loading state while fetching updated count -->
          <template v-if="mealCountLoading && !todaysCollections">
            <div class="total-loading">
              <v-icon size="24" class="rotating mb-2">mdi-loading</v-icon>
              <div class="total-label">updating daily total...</div>
            </div>
          </template>
          <!-- Show updated total or fallback to current portion -->
          <v-chip
            color="success"
            variant="tonal"
            size="large"
            prepend-icon="mdi-check-circle"
            class="collection-chip"
          >
            Total {{ todaysCollections }} Collected today
          </v-chip>
        </div>

        <div class="completion-time">
          <v-icon size="20" color="grey" class="me-2">mdi-clock-outline</v-icon>
          {{ detailedDateTime }}
        </div>
      </div>

      <!-- Home Button -->
      <v-btn
        color="grey-darken-1"
        size="x-large"
        block
        rounded="xl"
        class="py-4 home-button"
        @click="$emit('goHome')"
      >
        <v-icon start size="24" class="home-icon">mdi-home</v-icon>
        Back to Home
      </v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useMealCount } from '../composables/useMealCount'

interface Props {
  currentPortion: number
  detailedDateTime: string
  totalAmount: number // Add totalAmount prop
}

const props = defineProps<Props>()

defineEmits<{
  goHome: []
}>()

// Use the meal count composable to get the most up-to-date total
const { todaysCollections, isLoading: mealCountLoading, refreshMealCount } = useMealCount()

// Computed property to format the total amount
const formattedTotalAmount = computed(() => {
  return props.totalAmount.toFixed(2)
})

// Refresh meal count when component mounts to ensure we have the latest data
onMounted(async () => {
  await refreshMealCount()
})
</script>

<style scoped>
.fill-height {
  min-height: calc(100vh - 120px);
}

.max-width-container {
  max-width: 600px;
  margin: 0 auto;
}

@keyframes confettiStart {
  to {
    opacity: 1;
  }
}

.confetti {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  animation: confettiFall 3s linear infinite;
}

/* Individual confetti pieces with different colors and positions */
.confetti-1 {
  background: #ff6b6b;
  left: 10%;
  animation-delay: 1.6s;
}
.confetti-2 {
  background: #4ecdc4;
  left: 20%;
  animation-delay: 1.7s;
}
.confetti-3 {
  background: #45b7d1;
  left: 30%;
  animation-delay: 1.8s;
}
.confetti-4 {
  background: #96ceb4;
  left: 40%;
  animation-delay: 1.9s;
}
.confetti-5 {
  background: #feca57;
  left: 50%;
  animation-delay: 2s;
}
.confetti-6 {
  background: #ff9ff3;
  left: 60%;
  animation-delay: 2.1s;
}
.confetti-7 {
  background: #54a0ff;
  left: 70%;
  animation-delay: 2.2s;
}
.confetti-8 {
  background: #5f27cd;
  left: 80%;
  animation-delay: 2.3s;
}
.confetti-9 {
  background: #00d2d3;
  left: 90%;
  animation-delay: 2.4s;
}
.confetti-10 {
  background: #ff9ff3;
  left: 15%;
  animation-delay: 2.5s;
}
.confetti-11 {
  background: #54a0ff;
  left: 25%;
  animation-delay: 2.6s;
}
.confetti-12 {
  background: #5f27cd;
  left: 35%;
  animation-delay: 2.7s;
}
.confetti-13 {
  background: #ff6b6b;
  left: 45%;
  animation-delay: 2.8s;
}
.confetti-14 {
  background: #4ecdc4;
  left: 55%;
  animation-delay: 2.9s;
}
.confetti-15 {
  background: #45b7d1;
  left: 65%;
  animation-delay: 3s;
}
.confetti-16 {
  background: #96ceb4;
  left: 75%;
  animation-delay: 3.1s;
}
.confetti-17 {
  background: #feca57;
  left: 85%;
  animation-delay: 3.2s;
}
.confetti-18 {
  background: #ff9ff3;
  left: 95%;
  animation-delay: 3.3s;
}
.confetti-19 {
  background: #54a0ff;
  left: 5%;
  animation-delay: 3.4s;
}
.confetti-20 {
  background: #5f27cd;
  left: 95%;
  animation-delay: 3.5s;
}

@keyframes confettiFall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(200px) rotate(720deg);
    opacity: 0;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.highlight-card {
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: cardSlideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1s backwards;
}

.portion-card {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border: 2px solid #4caf50;
}

.amount-card {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border: 2px solid #2196f3;
}

.card-content {
  position: relative;
  z-index: 2;
}

.portion-number {
  font-size: 3.5rem !important;
  font-weight: 900 !important;
  color: #2e7d32;
  line-height: 1 !important;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
  animation: numberCountUp 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.2s backwards;
}

.portion-label {
  font-size: 1.2rem !important;
  font-weight: 700;
  color: #2e7d32;
  text-transform: uppercase;
  letter-spacing: 1px;
  animation: labelFadeIn 0.6s ease-out 1.5s backwards;
}

.amount-number {
  font-size: 3rem !important;
  font-weight: 900 !important;
  color: #1565c0;
  line-height: 1 !important;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 8px rgba(21, 101, 192, 0.2);
  animation: numberCountUp 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.4s backwards;
}

.amount-label {
  font-size: 1.2rem !important;
  font-weight: 700;
  color: #1565c0;
  text-transform: uppercase;
  letter-spacing: 1px;
  animation: labelFadeIn 0.6s ease-out 1.7s backwards;
}

.completion-title {
  animation: titleSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s backwards;
  color: #388e3c;
  text-align: center;
  font-weight: 800;
}

@keyframes titleSlideIn {
  0% {
    opacity: 0;
    transform: translateY(-30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.summary-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(76, 175, 80, 0.1);
  animation: cardSlideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.8s backwards;
  position: relative;
  overflow: hidden;
}

.collection-chip {
  font-size: 1rem;
  padding: 0.75rem 1.25rem;
  width: 100%;
  max-width: 300px;
  justify-content: center;
  margin: 0 auto 1rem;
}

.total-summary {
  margin-bottom: 1rem;
  text-align: center;
}

.total-loading {
  color: #888;
  animation: loadingFadeIn 0.6s ease-out 1.4s backwards;
}

.rotating {
  animation: rotate 1s linear infinite;
  color: #2196f3;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.completion-time {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  font-size: 0.9rem;
  animation: timeFadeIn 0.6s ease-out 2s backwards;
  position: relative;
  z-index: 2;
}

.home-button {
  animation: buttonSlideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 2.2s backwards;
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}

.home-button:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.alert-slide {
  animation: alertSlide 0.8s ease-out forwards;
  animation-delay: 1.2s;
  opacity: 0;
  transform: translateY(30px);
}

@keyframes alertSlide {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.instruction-alert {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(33, 150, 243, 0.2);
}

/* Animation keyframes */
@keyframes cardSlideUp {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes numberCountUp {
  0% {
    opacity: 0;
    transform: scale(0.5) rotateX(-90deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotateX(0deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotateX(0deg);
  }
}

@keyframes labelFadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes timeFadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive styles */
@media (max-width: 600px) {
  .fill-height {
    min-height: calc(100vh - 100px);
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .highlight-card {
    height: 150px;
  }

  .portion-number,
  .amount-number {
    font-size: 2.8rem !important;
  }

  .completion-title {
    font-size: 1.8rem !important;
  }

  .summary-card {
    padding: 1.25rem;
  }

  .collection-chip {
    max-width: 100%;
  }
}
</style>
