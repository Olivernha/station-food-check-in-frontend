<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { msalInstance } from '@/services/msal'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    const response = await msalInstance.handleRedirectPromise()

    if (response && response.account) {
      // Save account to store
      authStore.userAccount = response.account
      authStore.isAuthenticated = true

      // Fetch user profile + admin status
      await authStore.fetchUserProfile()

      // Redirect user after login
      router.replace('/')
    } else {
      // No response → maybe user navigated here manually
      router.replace('/login')
    }
  } catch (err) {
    console.error('Auth callback failed:', err)
    authStore.error = (err as Error).message
    router.replace('/login')
  }
})
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <p>Completing sign-in, please wait...</p>
  </div>
</template>
