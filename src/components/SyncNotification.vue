<template>
  <v-snackbar
    v-model="showNotification"
    :timeout="4000"
    color="success"
    location="top"
    :multi-line="false"
  >
    <div class="d-flex align-center">
      <v-icon class="mr-2">mdi-check-circle</v-icon>
      <span>{{ message }}</span>
    </div>

    <template v-slot:actions>
      <v-btn variant="text" size="small" @click="showNotification = false"> Close </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const showNotification = ref(false)
const message = ref('')

const handleSyncComplete = (event: CustomEvent) => {
  const { count } = event.detail
  if (count > 0) {
    const mealText = count === 1 ? 'meal' : 'meals'
    message.value = `Successfully synced ${count} ${mealText}!`
    showNotification.value = true
  }
}

onMounted(() => {
  window.addEventListener('offlineMealsSynced', handleSyncComplete as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('offlineMealsSynced', handleSyncComplete as EventListener)
})
</script>
