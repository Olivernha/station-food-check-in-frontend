<template>
  <v-app>
    <router-view />
    <PWAUpdatePrompt />
    <PWAInstallPrompt />
    <OfflineIndicator />
  </v-app>
</template>

<script setup lang="ts">
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'
import PWAUpdatePrompt from './components/PWAUpdatePrompt.vue'
import PWAInstallPrompt from './components/PWAInstallPrompt.vue'
import OfflineIndicator from './components/OfflineIndicator.vue'

const authStore = useAuthStore()
onMounted(async () => {
  await authStore.initialize()
})
</script>
