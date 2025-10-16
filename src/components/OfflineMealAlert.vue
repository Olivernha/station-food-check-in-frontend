<template>
  <!-- Critical Offline Alert Dialog -->
  <v-dialog v-model="showAlert" max-width="450" persistent :scrim="true">
    <v-card class="offline-alert-card">
      <v-card-title class="d-flex align-center text-h5 pa-6 pb-4">
        <v-icon color="orange-darken-2" size="32" class="mr-3">mdi-wifi-off</v-icon>
        <span class="text-orange-darken-2 font-weight-bold">No Internet Connection</span>
      </v-card-title>

      <v-card-text class="px-6 pb-2">
        <div class="text-body-1 mb-4">
          Your meal has been <strong>saved locally</strong> and will automatically sync when you're
          back online.
        </div>

        <v-alert type="warning" variant="tonal" class="mb-4" prominent>
          <div class="text-body-2">
            Please <strong>keep this app open</strong> until you get internet connection to ensure
            your meal data syncs properly.
          </div>
        </v-alert>

        <div class="d-flex align-center pa-3 bg-grey-lighten-4 rounded">
          <v-icon color="info" class="mr-3">mdi-information</v-icon>
          <div class="text-body-2">
            <div class="font-weight-medium">Meal Details Saved:</div>
            <div class="text-caption text-grey-darken-1">
              {{ mealDetails.portions }} portion{{ mealDetails.portions > 1 ? 's' : '' }} • ${{
                mealDetails.amount.toFixed(2)
              }}
              •
              {{ formatTime(mealDetails.timestamp) }}
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn
          color="orange-darken-2"
          variant="elevated"
          size="large"
          @click="acknowledgeAlert"
          class="px-6"
        >
          <v-icon start>mdi-check</v-icon>
          I Understand
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface MealDetails {
  portions: number
  amount: number
  timestamp: Date
}

interface Props {
  show: boolean
  mealDetails: MealDetails
}

const props = defineProps<Props>()
const emit = defineEmits<{
  acknowledge: []
}>()

const showAlert = ref(false)

// Watch for prop changes
watch(
  () => props.show,
  (newValue) => {
    showAlert.value = newValue
  },
)

const acknowledgeAlert = () => {
  showAlert.value = false
  emit('acknowledge')
}

const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}
</script>

<style scoped>
.offline-alert-card {
  animation: alertSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-top: 4px solid rgb(var(--v-theme-orange-darken-2));
}

@keyframes alertSlideIn {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.v-alert {
  border-left: 4px solid rgb(var(--v-theme-warning)) !important;
}
</style>
