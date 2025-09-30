<template>
  <v-container class="fill-height d-flex align-center justify-center px-4">
    <div class="text-center w-100 pa-4 step-container">
      <h1 class="text-h4 font-weight-bold mb-2 fade-in-up primary-text">Set Price</h1>

      <p class="text-h6 fade-in-up secondary-text">
        Total amount for {{ portions }} portion{{ portions > 1 ? 's' : '' }}
      </p>
      <p class="text-body-2 font-weight-bold max-limit">max $8 per portion</p>
      <div class="d-flex align-center justify-center my-9 scale-in amount-selector">
        <v-btn
          icon="mdi-minus"
          size="large"
          color="grey-lighten-1"
          class="me-4 button-hover minus-btn"
          @click="decreaseAmount"
          :disabled="parseFloat(totalAmount) <= 0.01 || isLoading"
        />

        <div class="text-center mx-3 amount-display">
          <v-text-field
            v-model="totalAmount"
            type="number"
            step="0.01"
            min="0.01"
            :max="portions * 8.0"
            variant="outlined"
            hide-details
            class="amount-input"
            prefix="$"
            @blur="validateAmount"
            @keyup.enter="handleSubmit"
          />
          <div class="text-caption text-uppercase mt-1 fade-in amount-label">
            total amount (SGD)
          </div>
        </div>

        <v-btn
          icon="mdi-plus"
          size="large"
          color="grey-lighten-1"
          class="ms-4 button-hover plus-btn"
          @click="increaseAmount"
          :disabled="parseFloat(totalAmount) >= portions * 8.0 || isLoading"
        />
      </div>

      <!-- Quick Add Buttons -->
      <div class="mb-4 fade-in quick-add-container">
        <p class="text-caption text-uppercase mb-3 quick-add-label font-weight-bold">
          Adjust Amount
        </p>

        <!-- Positive Buttons -->
        <div class="quick-add-row mb-2">
          <v-chip
            variant="outlined"
            color="success"
            class="adjust-amount-btn"
            @click="quickAdd(0.1)"
            :disabled="parseFloat(totalAmount) + 0.1 > portions * 8.0 || isLoading"
            clickable
            >+0.10</v-chip
          >

          <v-chip
            variant="outlined"
            color="primary"
            class="adjust-amount-btn"
            @click="quickAdd(0.5)"
            :disabled="parseFloat(totalAmount) + 0.5 > portions * 8.0 || isLoading"
            clickable
            >+0.50</v-chip
          >

          <v-chip
            variant="outlined"
            color="orange"
            class="adjust-amount-btn"
            @click="quickAdd(1.0)"
            :disabled="parseFloat(totalAmount) + 1.0 > portions * 8.0 || isLoading"
            clickable
            >+1</v-chip
          >
        </div>

        <!-- Negative Buttons -->
        <div class="quick-add-row">
          <v-chip
            variant="outlined"
            color="error"
            class="adjust-amount-btn"
            @click="quickAdd(-0.1)"
            :disabled="parseFloat(totalAmount) - 0.1 < 0.01 || isLoading"
            clickable
            >-0.10</v-chip
          >

          <v-chip
            variant="outlined"
            color="error"
            class="adjust-amount-btn"
            @click="quickAdd(-0.5)"
            :disabled="parseFloat(totalAmount) - 0.5 < 0.01 || isLoading"
            clickable
            >-0.50</v-chip
          >

          <v-chip
            variant="outlined"
            color="error"
            class="adjust-amount-btn"
            @click="quickAdd(-1.0)"
            :disabled="parseFloat(totalAmount) - 1.0 < 0.01 || isLoading"
            clickable
            >-1</v-chip
          >
        </div>
      </div>

      <!-- Action Buttons -->
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
            size="large"
            block
            rounded="xl"
            class="py-3 pulse-hover confirm-btn"
            :loading="isLoading"
            :disabled="!isValidAmount || isLoading"
            @click="handleSubmit"
          >
            <v-icon start size="20">mdi-check</v-icon>
            {{ isLoading ? 'Confirming...' : 'Continue' }}
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props
interface Props {
  portions: number
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

// Emits
const emit = defineEmits<{
  submit: [{ totalAmount: number }]
  back: []
}>()

// Local state
const totalAmount = ref((8.0 * props.portions).toFixed(2)) // Default $8.00 per portion

// Computed properties
const isValidAmount = computed(() => {
  const total = parseFloat(totalAmount.value)
  const maxTotal = props.portions * 8.0
  return total >= 0.01 && total <= maxTotal && !isNaN(total)
})

// Methods
const increaseAmount = () => {
  const current = parseFloat(totalAmount.value) || 0
  const maxTotal = props.portions * 8.0
  const newAmount = Math.min(maxTotal, current + 0.5)
  totalAmount.value = newAmount.toFixed(2)
}

const decreaseAmount = () => {
  const current = parseFloat(totalAmount.value) || 0
  const newAmount = Math.max(0.01, current - 0.5)
  totalAmount.value = newAmount.toFixed(2)
}

const quickAdd = (amount: number) => {
  const current = parseFloat(totalAmount.value) || 0
  const maxTotal = props.portions * 8.0
  let newAmount = current + amount

  // Clamp between 0.01 and maxTotal
  if (newAmount < 0.01) newAmount = 0.01
  if (newAmount > maxTotal) newAmount = maxTotal

  totalAmount.value = newAmount.toFixed(2)
}

const validateAmount = () => {
  const amount = parseFloat(totalAmount.value)
  const maxTotal = props.portions * 8.0
  if (isNaN(amount) || amount < 0.01) {
    totalAmount.value = '0.01'
  } else if (amount > maxTotal) {
    totalAmount.value = maxTotal.toFixed(2)
  } else {
    totalAmount.value = amount.toFixed(2)
  }
}

const handleSubmit = () => {
  if (isValidAmount.value) {
    emit('submit', {
      totalAmount: parseFloat(totalAmount.value),
    })
  }
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

.amount-selector {
  perspective: 1000px;
}

.amount-display {
  animation: amountFloat 3s ease-in-out infinite;
}

@keyframes amountFloat {
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

.action-buttons {
  animation-delay: 0.6s;
}

/* Text Visibility Enhancements */
.primary-text {
  color: rgb(var(--v-theme-primary));
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.secondary-text {
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.max-limit {
  color: rgb(var(--v-theme-error));
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  padding: 4px 12px;
  border-radius: 20px;
  background-color: rgba(var(--v-theme-error), 0.1);
  display: inline-block;
  margin-top: 8px;
}

/* Quick Add Buttons - Improved Alignment */
.quick-add-container {
  animation-delay: 0.5s;
}

.quick-add-label {
  font-weight: 600;
  letter-spacing: 0.5px;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.quick-add-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.adjust-amount-btn {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  font-weight: 600;
  min-width: 85px !important;
  width: 85px;
  height: 32px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 85px;
}

.adjust-amount-btn:hover:not(.v-chip--disabled) {
  transform: translateY(-2px) scale(1.08);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.adjust-amount-btn:active:not(.v-chip--disabled) {
  transform: translateY(0) scale(1.02);
}

/* Color-specific hover effects */
.adjust-amount-btn.v-chip--variant-outlined.text-success:hover:not(.v-chip--disabled) {
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.25);
}

.adjust-amount-btn.v-chip--variant-outlined.text-primary:hover:not(.v-chip--disabled) {
  box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.25);
}

.adjust-amount-btn.v-chip--variant-outlined.text-orange:hover:not(.v-chip--disabled) {
  box-shadow: 0 6px 16px rgba(255, 152, 0, 0.25);
}

/* Amount input styling */
.amount-input {
  width: 160px !important;
}

.amount-input :deep(.v-field__input) {
  font-size: 2.5rem !important;
  font-weight: bold !important;
  text-align: center !important;
  color: rgb(var(--v-theme-primary)) !important;
  padding: 15px 0 !important;
}

.amount-input :deep(.v-field__prefix) {
  font-size: 2rem !important;
  font-weight: bold !important;
  color: rgb(var(--v-theme-primary)) !important;
  padding-right: 6px;
}

.amount-input :deep(.v-field) {
  border-radius: 16px !important;
  min-height: 100px !important;
  border: 2px solid rgb(var(--v-theme-primary)) !important;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.amount-input :deep(.v-field__field) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.amount-input :deep(.v-field--focused) {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.2) !important;
  transform: scale(1.05);
}

/* Hide number input spinner buttons */
.amount-input :deep(input[type='number']::-webkit-outer-spin-button),
.amount-input :deep(input[type='number']::-webkit-inner-spin-button) {
  -webkit-appearance: none !important;
  appearance: none !important;
  margin: 0 !important;
}

.amount-input :deep(input[type='number']) {
  -moz-appearance: textfield !important;
  appearance: textfield !important;
}

/* Mobile specific styles */
@media (max-width: 600px) {
  .fill-height {
    min-height: calc(100vh - 120px);
  }

  .step-container {
    padding: 16px !important;
  }

  .text-h4 {
    font-size: 1.8rem !important;
    line-height: 1.2;
  }

  .text-h6 {
    font-size: 1rem !important;
  }

  .text-body-2 {
    font-size: 0.8rem !important;
  }

  .my-8 {
    margin-top: 1rem !important;
    margin-bottom: 1rem !important;
  }

  .amount-input {
    width: 120px !important;
  }

  .amount-input :deep(.v-field__input) {
    font-size: 2rem !important;
    padding: 12px 0 !important;
  }

  .amount-input :deep(.v-field__prefix) {
    font-size: 1.6rem !important;
  }

  .amount-input :deep(.v-field) {
    min-height: 90px !important;
    border-radius: 14px !important;
  }

  .amount-label {
    font-size: 0.7rem !important;
  }

  .quick-add-container {
    margin-bottom: 1.5rem !important;
  }

  .quick-add-row {
    gap: 8px !important;
    max-width: 280px;
  }

  .adjust-amount-btn {
    min-width: 70px !important;
    width: 70px;
    height: 30px;
    font-size: 0.75rem !important;
    flex: 0 0 70px;
  }

  .quick-add-label {
    font-size: 0.65rem !important;
    margin-bottom: 8px !important;
  }

  .max-limit {
    font-size: 0.75rem !important;
    padding: 3px 8px !important;
  }

  .button-hover:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  .pulse-hover:hover:not(:disabled) {
    transform: scale(1.02) translateY(-1px);
    box-shadow: 0 8px 16px rgba(76, 175, 80, 0.25);
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .quick-add-row {
    gap: 6px !important;
    max-width: 250px;
  }

  .adjust-amount-btn {
    min-width: 60px !important;
    width: 60px;
    height: 28px;
    font-size: 0.7rem !important;
    flex: 0 0 60px;
  }
}
</style>
