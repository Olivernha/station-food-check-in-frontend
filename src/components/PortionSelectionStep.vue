<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <div class="text-center w-100 pa-6 step-container">
      <h1 class="text-h3 font-weight-bold mb-2 fade-in-up">Select Portions</h1>

      <p class="text-h6 text-grey mb-8 fade-in-up">How many portions are you collecting?</p>

      <div class="d-flex align-center justify-center my-12 scale-in portion-selector">
        <v-btn
          icon="mdi-minus"
          size="x-large"
          color="grey-lighten-1"
          class="me-6 button-hover minus-btn"
          @click="decreasePortion"
          :disabled="portions <= 1 || isLoading"
        />

        <div class="text-center mx-6 portion-display">
          <v-text-field
            :model-value="portions"
            @update:model-value="updatePortions"
            type="number"
            variant="outlined"
            hide-details
            class="portion-input"
          />
          <div class="text-h6 text-grey text-uppercase mt-2 fade-in portion-label">
            portion{{ portions > 1 ? 's' : '' }}
          </div>
        </div>

        <v-btn
          icon="mdi-plus"
          size="x-large"
          color="grey-lighten-1"
          class="ms-6 button-hover plus-btn"
          @click="increasePortion"
          :disabled="portions >= 10000 || isLoading"
        />
      </div>
      <v-row class="fade-in-up action-buttons">
        <v-col cols="12" sm="5" class="px-2">
          <v-btn
            variant="outlined"
            size="large"
            block
            rounded="xl"
            class="py-3 button-hover back-btn"
            :disabled="isLoading"
            @click="$emit('back')"
          >
            <v-icon start>mdi-arrow-left</v-icon>
            Back
          </v-btn>
        </v-col>
        <v-col cols="12" sm="7" class="px-2">
          <v-btn
            color="success"
            size="x-large"
            block
            rounded="xl"
            class="py-4 fade-in-up pulse-hover confirm-btn"
            :loading="isLoading"
            :disabled="isLoading"
            @click="$emit('submit')"
          >
            <v-icon start size="24">mdi-check</v-icon>
            {{ isLoading ? 'Continuing...' : 'Continue' }}
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
interface Props {
  portions: number
  isLoading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:portions': [value: number]
  submit: []
  back: []
}>()

const updatePortions = (value: string | number) => {
  const numValue = typeof value === 'string' ? parseInt(value) || 1 : value
  emit('update:portions', Math.max(1, Math.min(10000, numValue)))
}

const increasePortion = () => {
  if (props.portions < 10000) {
    emit('update:portions', props.portions + 1)
  }
}

const decreasePortion = () => {
  if (props.portions > 1) {
    emit('update:portions', props.portions - 1)
  }
}
</script>

<style scoped>
.fill-height {
  min-height: calc(100vh - 160px);
}

.step-container {
  animation: fadeInScale 0.8s ease-out;
  max-width: 600px;
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
    transform: scale(0.3) rotate(-15deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotate(8deg);
  }
  70% {
    transform: scale(0.9) rotate(-3deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
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

.scale-in {
  animation: scaleIn 0.6s ease-out forwards;
  animation-delay: 0.4s;
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

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: 0.6s;
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

.portion-selector {
  perspective: 1000px;
}

.portion-display {
  animation: portionFloat 3s ease-in-out infinite;
}

@keyframes portionFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.button-hover {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.button-hover:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.pulse-hover {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.pulse-hover:hover:not(:disabled) {
  transform: scale(1.03) translateY(-2px);
  box-shadow: 0 12px 24px rgba(76, 175, 80, 0.3);
}

.confirm-btn {
  animation-delay: 0.8s;
}

/* Portion input styling */
.portion-input {
  width: 160px !important;
}

.portion-input :deep(.v-field__input) {
  font-size: 4rem !important;
  font-weight: bold !important;
  text-align: center !important;
  color: rgb(var(--v-theme-primary)) !important;
  padding: 20px 0 !important;
}

.portion-input :deep(.v-field) {
  border-radius: 20px !important;
  min-height: 120px !important;
  border: 3px solid rgb(var(--v-theme-primary)) !important;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.portion-input :deep(.v-field--focused) {
  border: 3px solid rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.2) !important;
  transform: scale(1.05);
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

.counter-icon {
  filter: drop-shadow(0 4px 8px rgba(33, 150, 243, 0.3));
}
.action-buttons {
  animation-delay: 0.6s;
}
</style>
