<template>
  <!-- Persistent Offline Status Bar -->
  <v-banner
    v-if="showStatusBar"
    color="orange-lighten-4"
    class="offline-status-bar"
    lines="one"
    sticky
  >
    <template #prepend>
      <v-icon color="orange-darken-2">
        {{ isOnline ? 'mdi-sync-alert' : 'mdi-wifi-off' }}
      </v-icon>
    </template>

    <div class="d-flex align-center justify-space-between w-100">
      <div>
        <div class="text-body-2 font-weight-medium text-orange-darken-2">
          {{ statusMessage }}
        </div>
        <div class="text-caption text-grey-darken-1">
          {{ statusSubtext }}
        </div>
      </div>

      <v-btn
        v-if="!isOnline"
        icon="mdi-information"
        size="small"
        variant="text"
        color="orange-darken-2"
        @click="showInfoDialog = true"
      />
    </div>
  </v-banner>

  <!-- Info Dialog -->
  <v-dialog v-model="showInfoDialog" max-width="400">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon color="orange" class="mr-2">mdi-information</v-icon>
        Offline Mode
      </v-card-title>

      <v-card-text>
        <div class="text-body-2 mb-3">
          You're currently offline. Your meals are safely stored locally and will sync automatically
          when internet connection is restored.
        </div>

        <v-alert type="info" variant="tonal" class="mb-3">
          <div class="text-body-2">
            <strong>Keep the app open</strong> to ensure automatic syncing when you're back online.
          </div>
        </v-alert>

        <div class="text-caption text-grey-darken-1">Pending meals: {{ pendingMealsCount }}</div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="showInfoDialog = false"> Got it </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useOfflineStatus } from '@/composables/useOfflineStatus'
import { useMealStore } from '@/stores/mealStore'

const { isOnline, pendingMealsCount } = useOfflineStatus()
const mealStore = useMealStore()
const showInfoDialog = ref(false)

const showStatusBar = computed(() => {
  return !isOnline.value || pendingMealsCount.value > 0 || mealStore.isSyncing
})

const statusMessage = computed(() => {
  if (mealStore.isSyncing) {
    return `Syncing ${pendingMealsCount.value} meal${pendingMealsCount.value > 1 ? 's' : ''}...`
  } else if (!isOnline.value) {
    return pendingMealsCount.value > 0
      ? `${pendingMealsCount.value} meal${pendingMealsCount.value > 1 ? 's' : ''} waiting to sync`
      : "You're offline"
  } else if (pendingMealsCount.value > 0) {
    return `${pendingMealsCount.value} meal${pendingMealsCount.value > 1 ? 's' : ''} pending sync`
  }
  return ''
})

const statusSubtext = computed(() => {
  if (mealStore.isSyncing) {
    return 'Syncing in progress...'
  } else if (!isOnline.value) {
    return 'Keep app open for auto-sync when online'
  } else if (pendingMealsCount.value > 0) {
    return 'Will sync automatically'
  }
  return ''
})
</script>

<style scoped>
.offline-status-bar {
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(var(--v-theme-orange), 0.2);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  0% {
    opacity: 0;
    transform: translateY(-100%);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
