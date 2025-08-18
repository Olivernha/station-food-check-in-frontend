<template>
  <v-snackbar
    v-model="showInstallPrompt"
    :timeout="10000"
    color="success"
    location="bottom"
    multi-line
  >
    <div class="d-flex align-center">
      <v-icon class="mr-2">mdi-cellphone-arrow-down</v-icon>
      <span>Install this app for a better experience!</span>
    </div>

    <template v-slot:actions>
      <v-btn color="white" variant="text" @click="installApp"> Install </v-btn>
      <v-btn color="white" variant="text" @click="dismissInstall"> Not now </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showInstallPrompt = ref(false)
let deferredPrompt: any = null

const installApp = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    deferredPrompt = null
    showInstallPrompt.value = false
  }
}

const dismissInstall = () => {
  showInstallPrompt.value = false
  // Don't show again for this session
  sessionStorage.setItem('pwa-install-dismissed', 'true')
}

onMounted(() => {
  // Check if already dismissed this session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return
  }

  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    // Stash the event so it can be triggered later
    deferredPrompt = e
    // Show our custom install prompt
    showInstallPrompt.value = true
  })

  // Listen for the app being installed
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed')
    showInstallPrompt.value = false
    deferredPrompt = null
  })
})
</script>
