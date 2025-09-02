// src/stores/authStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  PublicClientApplication,
  type AccountInfo,
  type AuthenticationResult,
} from '@azure/msal-browser'
import { msalService } from '@/services/msalService'
import { apiService } from '@/services/apiService'

interface UserInfo {
  entraId: string
  displayName: string
  email: string
  jobTitle?: string
  department?: string
  id: string
  entity?: string
}

interface AuthState {
  user: UserInfo | null
  account: AccountInfo | null
  isAuthenticated: boolean
  accessToken: string | null
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<UserInfo | null>(null)
  const account = ref<AccountInfo | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const error = ref('')
  const accessToken = ref<string | null>(null)

  // Services
  const auth = msalService()
  const api = apiService()

  // Getters
  const userDisplayName = computed(() => user.value?.displayName || 'Unknown User')
  const userEmail = computed(() => user.value?.email || '')

  // ---- Actions ----
  const login = (authData: AuthState): void => {
    user.value = authData.user
    account.value = authData.account
    isAuthenticated.value = authData.isAuthenticated
    accessToken.value = authData.accessToken
    error.value = ''

    localStorage.setItem('auth_user', JSON.stringify(authData.user))
    localStorage.setItem('auth_account', JSON.stringify(authData.account))
    localStorage.setItem('is_authenticated', JSON.stringify(authData.isAuthenticated))
    localStorage.setItem('auth_access_token', JSON.stringify(authData.accessToken))
  }

  const logout = async (): Promise<void> => {
    try {
      isLoading.value = true
      if (account.value) {
        await auth.logout(account.value)
      }
    } finally {
      user.value = null
      account.value = null
      isAuthenticated.value = false
      accessToken.value = null
      localStorage.clear()
      isLoading.value = false
    }
  }

  const bootstrapAuth = async (): Promise<boolean> => {
    /**
     * Centralized login bootstrap:
     * - Initialize MSAL
     * - Handle redirect
     * - Get account + token + user profile
     * - Update store
     */
    try {
      isLoading.value = true
      await auth.initialize()
      await auth.handleRedirect()

      const acc = auth.getActiveAccount()
      if (!acc) return false

      const token = await auth.getToken(['User.Read'])
      const profile = await api.getUserProfile()
      const userInfo: UserInfo = {
        entraId: (profile.mail || profile.userPrincipalName).split('@')[0],
        displayName: profile.displayName,
        email: profile.mail || profile.userPrincipalName,
        jobTitle: profile.jobTitle || '',
        department: profile.department || '',
        id: profile.id,
      }

      login({ user: userInfo, account: acc, isAuthenticated: true, accessToken: token })
      return true
    } catch (err) {
      console.error('bootstrapAuth failed:', err)
      error.value = err instanceof Error ? err.message : 'Authentication failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    account,
    isAuthenticated,
    isLoading,
    error,
    accessToken,
    userDisplayName,
    userEmail,
    login,
    logout,
    bootstrapAuth,
  }
})
