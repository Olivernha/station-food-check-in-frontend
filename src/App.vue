<template>
  <v-app>
    <router-view />
    <PWAUpdatePrompt />
    <PWAInstallPrompt />
    <OfflineIndicator />
  </v-app>
</template>

<script setup lang="ts">
import PWAUpdatePrompt from './components/PWAUpdatePrompt.vue'
import PWAInstallPrompt from './components/PWAInstallPrompt.vue'
import OfflineIndicator from './components/OfflineIndicator.vue'
// Auth initialization is handled in main.ts, no need to duplicate here
</script>
