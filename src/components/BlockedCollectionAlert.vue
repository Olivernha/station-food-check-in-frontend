<template>
  <!-- Collection Blocked Alert Dialog -->
  <v-dialog v-model="showAlert" max-width="450" persistent :scrim="true">
    <v-card class="blocked-alert-card">
      <v-card-title
        class="d-flex align-center text-h5 pa-6 pb-4"
        :class="smAndDown ? 'pa-4 pb-3' : ''"
      >
        <v-icon color="error" :size="smAndDown ? 24 : 32" class="mr-3"> mdi-block-helper </v-icon>
        <span class="text-error font-weight-bold" :class="smAndDown ? 'text-subtitle-1' : ''">
          Collection Blocked
        </span>
      </v-card-title>

      <v-card-text class="px-6 pb-2" :class="smAndDown ? 'px-4 pb-4' : ''">
        <div class="text-body-1 mb-4" :class="smAndDown ? 'text-body-2' : ''">
          {{ message }}
        </div>

        <v-alert type="error" variant="tonal" class="mb-4" prominent dense>
          <v-alert-title class="text-h6 mb-2" :class="smAndDown ? 'text-subtitle-2' : ''">
            <v-icon class="mr-2" :size="smAndDown ? 18 : 24">mdi-wifi-sync</v-icon>
            Action Required
          </v-alert-title>
          <div class="text-body-2" :class="smAndDown ? 'text-caption' : ''">
            Please <strong>connect to internet</strong> and wait for your old meal data to sync
            before collecting new meals.
          </div>
        </v-alert>

        <div
          class="d-flex align-center pa-3 bg-grey-lighten-4 rounded"
          :class="smAndDown ? 'pa-2' : ''"
        >
          <v-icon color="info" class="mr-3" :size="smAndDown ? 18 : 24">mdi-information</v-icon>
          <div class="text-body-2" :class="smAndDown ? 'text-caption' : ''">
            <div class="font-weight-medium">Maximum unsync period:</div>
            <div class="text-caption text-grey-darken-1">{{ maxDays }} days</div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="px-6 pb-6" :class="smAndDown ? 'px-4 pb-4' : ''">
        <v-spacer />
        <v-btn
          color="error"
          variant="elevated"
          size="large"
          @click="acknowledgeAlert"
          class="px-6"
          :class="smAndDown ? 'px-4 py-2' : ''"
        >
          <v-icon start :size="smAndDown ? 18 : 24">mdi-check</v-icon>
          I Understand
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useDisplay } from 'vuetify'

interface Props {
  show: boolean
  message: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  acknowledge: []
}>()

const showAlert = ref(false)
const { smAndDown } = useDisplay()

// Get max days from environment
const maxDays = computed(() => Number(import.meta.env.VITE_MAX_UNSYNC_DAYS))

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
</script>

<style scoped>
.blocked-alert-card {
  animation: alertSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-top: 4px solid rgb(var(--v-theme-error));
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
  border-left: 4px solid rgb(var(--v-theme-error)) !important;
}
</style>
