<template>
  <!-- Android/Desktop Install Prompt -->
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

  <!-- iOS Install Instructions Dialog -->
  <v-dialog v-model="showIOSInstructions" max-width="400">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-apple</v-icon>
        Install App
      </v-card-title>

      <v-card-text>
        <div class="text-body-1 mb-4">To install this app on your iPhone:</div>

        <div class="install-steps">
          <div class="step mb-3">
            <div class="d-flex align-center mb-2">
              <v-avatar size="24" color="primary" class="mr-3">
                <span class="text-white text-caption">1</span>
              </v-avatar>
              <span class="font-weight-medium">Tap the Share button</span>
            </div>
            <div class="d-flex align-center">
              <v-icon class="mr-2" size="20">mdi-export-variant</v-icon>
              <span class="text-body-2">
                {{ isIOSSafari ? 'At the bottom of the screen' : 'In the browser menu' }}
              </span>
            </div>
          </div>

          <div class="step mb-3">
            <div class="d-flex align-center mb-2">
              <v-avatar size="24" color="primary" class="mr-3">
                <span class="text-white text-caption">2</span>
              </v-avatar>
              <span class="font-weight-medium">Select "Add to Home Screen"</span>
            </div>
            <div class="d-flex align-center">
              <v-icon class="mr-2" size="20">mdi-plus-box</v-icon>
              <span class="text-body-2">Scroll down to find this option</span>
            </div>
          </div>

          <div class="step">
            <div class="d-flex align-center mb-2">
              <v-avatar size="24" color="primary" class="mr-3">
                <span class="text-white text-caption">3</span>
              </v-avatar>
              <span class="font-weight-medium">Tap "Add"</span>
            </div>
            <div class="d-flex align-center">
              <v-icon class="mr-2" size="20">mdi-check</v-icon>
              <span class="text-body-2">The app will be added to your home screen</span>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="dismissIOSInstructions"> Maybe Later </v-btn>
        <v-btn color="primary" variant="text" @click="dismissIOSInstructions"> Got it! </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- iOS Install Banner -->
  <v-banner v-if="showIOSBanner" color="primary" icon="mdi-cellphone-arrow-down" lines="two" sticky>
    <v-banner-text>
      <strong>Install MealCheck App</strong><br />
      Add to your home screen for quick access
    </v-banner-text>

    <template v-slot:actions>
      <v-btn
        variant="outlined"
        color="white"
        size="small"
        class="banner-btn"
        @click="showIOSInstallInstructions"
      >
        How?
      </v-btn>
      <v-btn
        variant="text"
        color="white"
        size="small"
        class="banner-btn ml-2"
        @click="dismissIOSBanner"
      >
        Dismiss
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
  padding-left: 8px;
}

.step {
  border-left: 2px solid #e0e0e0;
  padding-left: 16px;
  position: relative;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  left: -1px;
  bottom: -12px;
  width: 2px;
  height: 12px;
  background-color: #e0e0e0;
}

.v-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.banner-btn {
  color: white !important;
  border-color: white !important;
  min-width: 60px !important;
}

.banner-btn:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* Ensure banner text is visible */
:deep(.v-banner-text) {
  color: white !important;
}

/* Ensure banner actions are visible */
:deep(.v-banner__actions) {
  align-items: center;
}
</style>
