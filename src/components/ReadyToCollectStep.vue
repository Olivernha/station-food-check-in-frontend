<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <div class="text-center w-100 pa-6 step-container">
      <v-icon size="80" color="success" class="mb-6 bounce-in user-icon">
        mdi-account-check
      </v-icon>

      <h1 class="text-h3 font-weight-bold mb-2 fade-in-up greeting-text">Hello, {{ userName }}</h1>

      <p class="text-h6 text-grey mb-8 fade-in-up subtitle-text">Ready to collect your meal?</p>

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
    </div>
  </v-container>
</template>

<script setup lang="ts">
interface Props {
  userName: string
  isLoading: boolean
}

defineProps<Props>()
defineEmits<{
  collectMeal: []
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

.collect-btn {
  animation-delay: 0.7s;
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
