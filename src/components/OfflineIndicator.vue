<template>
  <v-snackbar v-model="showOfflineMessage" :timeout="-1" color="warning" location="top">
    <div class="d-flex align-center">
      <v-icon class="mr-2">mdi-wifi-off</v-icon>
      <span>You're currently offline. Some features may not be available.</span>
    </div>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const showOfflineMessage = ref(false)

const updateOnlineStatus = () => {
  showOfflineMessage.value = !navigator.onLine
}

onMounted(() => {
  // Check initial status
  updateOnlineStatus()

  // Listen for online/offline events
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>
