<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <div class="text-center w-100 pa-6 step-container">
      <!-- Success Animation -->
      <div class="success-animation mb-6">
        <div class="success-circle">
          <v-icon size="80" color="success" class="success-icon"> mdi-check-circle </v-icon>
          <div class="success-ripple ripple-1"></div>
          <div class="success-ripple ripple-2"></div>
          <div class="success-ripple ripple-3"></div>
        </div>
        <div class="confetti-container">
          <div class="confetti" v-for="i in 20" :key="i" :class="`confetti-${i}`"></div>
        </div>
      </div>

      <!-- Title -->
      <h1 class="text-h3 font-weight-bold mb-8 completion-title">Collection Complete</h1>

      <!-- Summary Card -->
      <div class="summary-card mb-8">
        <div class="summary-header">
          <div class="completion-number">
            {{ totalPortions }}
          </div>
          <div class="completion-label">
            portion{{ totalPortions > 1 ? 's' : '' }} collected today
          </div>
        </div>

        <div class="summary-divider"></div>

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
interface Props {
  totalPortions: number
  detailedDateTime: string
}

defineProps<Props>()

defineEmits<{
  goHome: []
}>()
</script>

<style scoped>
.fill-height {
  min-height: calc(100vh - 160px);
}

.step-container {
  animation: containerFadeIn 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes containerFadeIn {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.success-animation {
  position: relative;
  display: inline-block;
  animation: successAnimationEntry 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s backwards;
}

@keyframes successAnimationEntry {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-45deg);
  }
  60% {
    opacity: 1;
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.success-circle {
  position: relative;
  display: inline-block;
}

.success-icon {
  position: relative;
  z-index: 10;
  animation: successIconPulse 2s ease-in-out infinite;
  filter: drop-shadow(0 4px 12px rgba(76, 175, 80, 0.4));
}

@keyframes successIconPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.success-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 3px solid rgba(76, 175, 80, 0.6);
  border-radius: 50%;
  animation: rippleOut 2s infinite ease-out;
}

.ripple-1 {
  width: 120px;
  height: 120px;
  animation-delay: 0s;
}

.ripple-2 {
  width: 140px;
  height: 140px;
  animation-delay: 0.5s;
}

.ripple-3 {
  width: 160px;
  height: 160px;
  animation-delay: 1s;
}

@keyframes rippleOut {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.confetti-container {
  position: absolute;
  top: -20px;
  left: -50px;
  width: 200px;
  height: 200px;
  pointer-events: none;
  animation: confettiStart 0.1s 1.5s forwards;
  opacity: 0;
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

.completion-title {
  animation: titleSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s backwards;
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  padding: 2rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(76, 175, 80, 0.1);
  animation: cardSlideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.9s backwards;
  position: relative;
  overflow: hidden;
}

@keyframes cardSlideUp {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.1), transparent);
  animation: cardShimmer 3s infinite;
  animation-delay: 2s;
}

@keyframes cardShimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.summary-header {
  position: relative;
  z-index: 2;
}

.completion-number {
  font-size: 5rem !important;
  font-weight: 900 !important;
  color: #4caf50;
  line-height: 1 !important;
  margin-bottom: 1rem;
  animation: numberCountUp 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.2s backwards;
  text-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
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

.completion-label {
  font-size: 1.25rem !important;
  font-weight: 500;
  color: #666;
  margin-bottom: 1.5rem;
  animation: labelFadeIn 0.6s ease-out 1.5s backwards;
  letter-spacing: 1px;
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

.summary-divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, #4caf50, transparent);
  margin: 1.5rem 0;
  animation: dividerExpand 0.8s ease-out 1.7s backwards;
  transform: scaleX(0);
}

@keyframes dividerExpand {
  0% {
    transform: scaleX(0);
  }
  100% {
    transform: scaleX(1);
  }
}

.completion-time {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  font-size: 1rem;
  animation: timeFadeIn 0.6s ease-out 1.9s backwards;
  position: relative;
  z-index: 2;
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

.home-button {
  animation: buttonSlideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s backwards;
  opacity: 1; /* default visible */
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}

@keyframes buttonSlideUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.home-button:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.home-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s;
}

.home-button:hover::after {
  left: 100%;
}

.home-icon {
  transition: all 0.3s ease;
}

.home-button:hover .home-icon {
  transform: scale(1.1) translateX(-2px);
}
</style>
