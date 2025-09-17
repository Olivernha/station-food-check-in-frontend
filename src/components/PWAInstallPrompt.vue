<template>
  <!-- Android/Desktop Install Prompt -->
  <v-snackbar
    v-model="showInstallPrompt"
    :timeout="10000"
    color="deep-purple-darken-2"
    location="bottom"
    multi-line
    elevation="8"
    rounded="lg"
  >
    <div class="d-flex align-center">
      <v-icon class="mr-3" color="amber-lighten-2" size="28">mdi-download-circle</v-icon>
      <div>
        <div class="font-weight-bold text-white">Install MealCheck</div>
        <div class="text-grey-lighten-3 text-caption">Get instant access with offline support</div>
      </div>
    </div>

    <template v-slot:actions>
      <v-btn
        variant="elevated"
        color="amber-darken-1"
        class="text-deep-purple-darken-2 font-weight-bold"
        rounded="lg"
        @click="installApp"
      >
        Install Now
      </v-btn>
      <v-btn variant="text" color="grey-lighten-2" @click="dismissInstall"> Later </v-btn>
    </template>
  </v-snackbar>

  <!-- iOS Install Instructions Dialog -->
  <v-dialog v-model="showIOSInstructions" max-width="420" persistent>
    <v-card class="pa-2" rounded="xl" elevation="12">
      <v-card-title class="d-flex align-center pa-6 pb-4">
        <v-avatar size="40" color="gradient-primary" class="mr-4">
          <v-icon color="white" size="24">mdi-apple</v-icon>
        </v-avatar>
        <div>
          <div class="text-h6 font-weight-bold text-deep-purple-darken-2">Install MealCheck</div>
          <div class="text-caption text-grey-darken-1">Add to your home screen</div>
        </div>
      </v-card-title>

      <v-card-text class="px-6 pb-4">
        <v-alert
          color="teal-lighten-5"
          border="start"
          border-color="teal"
          class="mb-4"
          rounded="lg"
        >
          <div class="text-body-2 text-teal-darken-2">
            <v-icon class="mr-2" color="teal" size="20">mdi-information</v-icon>
            Follow these steps to install the app on your iPhone
          </div>
        </v-alert>

        <div class="install-steps">
          <div class="step mb-4">
            <div class="d-flex align-center mb-3">
              <v-avatar size="32" color="gradient-step" class="mr-4 step-number">
                <span class="text-white font-weight-bold">1</span>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="font-weight-bold text-deep-purple-darken-2">Tap the Share button</div>
                <div class="text-caption text-grey-darken-1">Located at the bottom of Safari</div>
              </div>
            </div>
            <div class="d-flex align-center ml-12">
              <v-chip
                color="blue-lighten-4"
                size="small"
                class="mr-2"
                prepend-icon="mdi-export-variant"
              >
                <span class="text-blue-darken-2">Share</span>
              </v-chip>
            </div>
          </div>

          <div class="step mb-4">
            <div class="d-flex align-center mb-3">
              <v-avatar size="32" color="gradient-step" class="mr-4 step-number">
                <span class="text-white font-weight-bold">2</span>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="font-weight-bold text-deep-purple-darken-2">
                  Select "Add to Home Screen"
                </div>
                <div class="text-caption text-grey-darken-1">Scroll down in the share menu</div>
              </div>
            </div>
            <div class="d-flex align-center ml-12">
              <v-chip color="green-lighten-4" size="small" class="mr-2" prepend-icon="mdi-plus-box">
                <span class="text-green-darken-2">Add to Home Screen</span>
              </v-chip>
            </div>
          </div>

          <div class="step">
            <div class="d-flex align-center mb-3">
              <v-avatar size="32" color="gradient-step" class="mr-4 step-number">
                <span class="text-white font-weight-bold">3</span>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="font-weight-bold text-deep-purple-darken-2">Tap "Add"</div>
                <div class="text-caption text-grey-darken-1">Confirm to install the app</div>
              </div>
            </div>
            <div class="d-flex align-center ml-12">
              <v-chip
                color="amber-lighten-4"
                size="small"
                class="mr-2"
                prepend-icon="mdi-check-circle"
              >
                <span class="text-amber-darken-3">Add</span>
              </v-chip>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-spacer></v-spacer>
        <v-btn
          color="grey-lighten-1"
          variant="outlined"
          rounded="lg"
          @click="dismissIOSInstructions"
        >
          Maybe Later
        </v-btn>
        <v-btn
          color="deep-purple-darken-1"
          variant="elevated"
          rounded="lg"
          class="ml-3"
          @click="dismissIOSInstructions"
        >
          Got it!
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- iOS Install Banner -->
  <v-banner
    v-if="showIOSBanner"
    color="gradient-banner"
    lines="two"
    sticky
    elevation="6"
    rounded="0 0 16 16"
  >
    <template v-slot:prepend>
      <v-avatar color="white" size="48" class="mr-4">
        <v-icon color="deep-purple-darken-2" size="28">mdi-cellphone-arrow-down</v-icon>
      </v-avatar>
    </template>

    <v-banner-text class="banner-text">
      <div class="text-white font-weight-bold text-body-1">Install MealCheck App</div>
      <div class="text-grey-lighten-4 text-body-2">
        Quick access • Offline support • Native experience
      </div>
    </v-banner-text>

    <template v-slot:actions>
      <v-btn
        variant="elevated"
        color="white"
        size="small"
        class="text-deep-purple-darken-2 font-weight-bold mr-2"
        rounded="lg"
        @click="showIOSInstallInstructions"
      >
        Install Now
      </v-btn>
      <v-btn variant="text" color="white" size="small" @click="dismissIOSBanner">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-banner>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showInstallPrompt = ref(false)
const showIOSInstructions = ref(false)
const showIOSBanner = ref(false)
const isIOSSafari = ref(false)
const isIOSChrome = ref(false)
const isIOS = ref(false)
let deferredPrompt: BeforeInstallPromptEvent | null = null

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Detect iOS devices and browsers
const detectIOSDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
  const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent)
  const isChrome = /crios/.test(userAgent)

  isIOS.value = isIOSDevice
  isIOSSafari.value = isIOSDevice && isSafari
  isIOSChrome.value = isIOSDevice && isChrome

  return { isIOSDevice, isSafari, isChrome }
}

// Check if app is already installed (running in standalone mode)
const isAppInstalled = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown).standalone === true
  )
}

// Check if user has dismissed install prompts
const hasUserDismissedInstall = () => {
  const dismissed = localStorage.getItem('pwa-install-dismissed')
  const dismissedDate = localStorage.getItem('pwa-install-dismissed-date')

  if (!dismissed || !dismissedDate) return false

  // Show again after 7 days
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return parseInt(dismissedDate) > sevenDaysAgo
}

const installApp = async () => {
  if (deferredPrompt) {
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    deferredPrompt = null
    showInstallPrompt.value = false
  }
}

const dismissInstall = () => {
  showInstallPrompt.value = false
  localStorage.setItem('pwa-install-dismissed', 'true')
  localStorage.setItem('pwa-install-dismissed-date', Date.now().toString())
}

const showIOSInstallInstructions = () => {
  showIOSBanner.value = false
  showIOSInstructions.value = true
}

const dismissIOSInstructions = () => {
  showIOSInstructions.value = false
  localStorage.setItem('pwa-install-dismissed', 'true')
  localStorage.setItem('pwa-install-dismissed-date', Date.now().toString())
}

const dismissIOSBanner = () => {
  console.log('Dismissing iOS banner')
  showIOSBanner.value = false
  localStorage.setItem('pwa-install-dismissed', 'true')
  localStorage.setItem('pwa-install-dismissed-date', Date.now().toString())
}

onMounted(() => {
  const { isIOSDevice } = detectIOSDevice()

  // Don't show if app is already installed
  if (isAppInstalled()) {
    console.log('App is already installed')
    return
  }

  // Don't show if user has recently dismissed
  if (hasUserDismissedInstall()) {
    console.log('User has dismissed install prompt recently')
    return
  }

  if (isIOSDevice) {
    // For iOS devices, show banner after a short delay
    setTimeout(() => {
      showIOSBanner.value = true
    }, 3000)
  } else {
    // For Android/Desktop, use the standard beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault()
      deferredPrompt = e as BeforeInstallPromptEvent
      showInstallPrompt.value = true
    })
  }

  // Listen for the app being installed
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed')
    showInstallPrompt.value = false
    showIOSBanner.value = false
    deferredPrompt = null
  })
})
</script>

<style scoped>
.install-steps {
  position: relative;
}

.step {
  position: relative;
  padding-bottom: 8px;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 16px;
  top: 40px;
  width: 2px;
  height: calc(100% - 8px);
  background: linear-gradient(180deg, #7c3aed 0%, #a855f7 100%);
  opacity: 0.3;
  border-radius: 1px;
}

.step-number {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%) !important;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.v-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1200;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%) !important;
}

.banner-text {
  color: white !important;
}

/* Custom gradient classes */
:deep(.v-avatar.gradient-primary) {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%) !important;
}

:deep(.v-avatar.gradient-step) {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%) !important;
}

/* Enhanced card styling */
:deep(.v-card) {
  border: 1px solid rgba(124, 58, 237, 0.1);
}

/* Button hover effects */
:deep(.v-btn) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-btn:hover) {
  transform: translateY(-1px);
}

/* Chip styling */
:deep(.v-chip) {
  font-weight: 600;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* Banner animations */
.v-banner {
  animation: slideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Snackbar custom styling */
:deep(.v-snackbar__wrapper) {
  backdrop-filter: blur(10px);
}

/* Dialog entrance animation */
:deep(.v-dialog > .v-overlay__content) {
  animation: modalFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
