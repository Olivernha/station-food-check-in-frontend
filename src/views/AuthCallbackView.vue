<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { msalInstance } from '@/services/msal'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    console.log('Processing authentication callback...')

    // This is the critical part - process the auth response from Microsoft
    const response = await msalInstance.handleRedirectPromise()

    if (response && response.account) {
      // Success! We got the authenticated user
      console.log('Authentication successful for:', response.account.username)

      // Save to your auth store
      authStore.userAccount = response.account
      authStore.isAuthenticated = true
      authStore.error = null

      // Fetch additional user profile if needed
      await authStore.fetchUserProfile()

      // Redirect to intended destination
      const returnUrl = sessionStorage.getItem('returnUrl') || '/'
      sessionStorage.removeItem('returnUrl')

      router.replace(returnUrl)
    } else {
      // No response - check if user is already authenticated
      const accounts = msalInstance.getAllAccounts()
      if (accounts.length > 0) {
        // User already has valid session
        authStore.userAccount = accounts[0]
        authStore.isAuthenticated = true
        await authStore.fetchUserProfile()
        router.replace('/')
      } else {
        // No auth data - redirect to login
        console.log('No authentication data found')
        router.replace('/login')
      }
    }
  } catch (err) {
    console.error('Authentication failed:', err)
    error.value = (err as Error).message || 'Authentication failed'
    authStore.error = error.value

    // Show error briefly, then redirect to login
    setTimeout(() => {
      router.replace('/login')
    }, 3000)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <div class="text-center space-y-4">
      <!-- Loading -->
      <div v-if="loading">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p>Completing sign-in, please wait...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-red-600">
        <p class="font-medium">Authentication Failed</p>
        <p class="text-sm mt-2">{{ error }}</p>
        <p class="text-xs text-gray-500 mt-2">Redirecting to login...</p>
      </div>

      <!-- Success (brief moment before redirect) -->
      <div v-else>
        <p class="text-green-600">Success! Redirecting...</p>
      </div>
    </div>
  </div>
</template>
