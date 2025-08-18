<template>
  <v-snackbar v-model="showUpdatePrompt" :timeout="-1" color="primary" location="bottom" multi-line>
    <div class="d-flex align-center">
      <v-icon class="mr-2">mdi-download</v-icon>
      <span>A new version is available!</span>
    </div>

    <template v-slot:actions>
      <v-btn color="white" variant="text" @click="updateApp"> Update </v-btn>
      <v-btn color="white" variant="text" @click="dismissUpdate"> Later </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showUpdatePrompt = ref(false)
let updateSW: (() => Promise<void>) | null = null

const updateApp = async () => {
  if (updateSW) {
    await updateSW()
    showUpdatePrompt.value = false
    // Reload the page to apply the update
    window.location.reload()
  }
}

const dismissUpdate = () => {
  showUpdatePrompt.value = false
}

onMounted(async () => {
  // Check if PWA update is available
  if ('serviceWorker' in navigator) {
    try {
      const { registerSW } = await import('virtual:pwa-register')

      updateSW = registerSW({
        onNeedRefresh() {
          showUpdatePrompt.value = true
        },
        onOfflineReady() {
          console.log('App ready to work offline')
        },
      })
    } catch (error) {
      console.log('PWA not available')
    }
  }
})
</script>
