import { defineStore } from 'pinia'
import { msalInstance } from '../services/msal'
import { loginRequest } from '../config/msalConfig'
import type { AccountInfo } from '@azure/msal-browser'
import apiClient from '@/services/api'
interface UserInfo {
  entraAd: string
  displayName: string
  email: string
  jobTitle?: string
  department?: string
  id: string
  entity?: string

}
export const useAuthStore = defineStore('auth', {
  state: () => ({
    userAccount: null as AccountInfo | null,
    user: null as UserInfo | null,
    isAdmin: false,
    isAuthenticated: false,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    hasError: (state) => !!state.error,
    isReady: (state) => !state.isLoading && state.isAuthenticated,
    accessTokenScopes: () => ['User.Read'], // Default scopes
  },

  actions: {
    async initialize() {
      this.isLoading = true
      try {
        const accounts = msalInstance.getAllAccounts()
        if (accounts.length > 0) {
          this.userAccount = accounts[0]
          this.isAuthenticated = true
          await this.fetchUserProfile()

        }
      } catch (error: any) {
        console.error('Auth initialization failed:', error)
        this.error = error.message || 'Failed to initialize authentication'
      } finally {
        this.isLoading = false
      }
    },

    async login() {
      this.isLoading = true
      this.error = null
      try {
        const response = await msalInstance.loginPopup(loginRequest)
        this.userAccount = response.account
        this.isAuthenticated = true
        await this.fetchUserProfile()
        return response
      } catch (error: any) {
        console.error('Login failed:', error)

        // Handle specific MSAL errors
        if (error.errorCode === 'user_cancelled') {
          this.error = 'Login cancelled by user'
        } else if (error.errorCode === 'popup_window_error') {
          this.error = 'Popup blocked. Please allow popups for this site.'
        } else {
          this.error = error.errorMessage || error.message || 'Login failed'
        }

        throw error
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        await msalInstance.logoutPopup()
        this.reset()
      } catch (error: any) {
        console.error('Logout failed:', error)
        this.error = error.message || 'Logout failed'
      }
    },

    async fetchUserProfile() {
      try {
        if (!this.userAccount) return null

        // Fetch from Microsoft Graph API

        const accessToken = await this.getAccessToken()
        const response = await fetch(
          'https://graph.microsoft.com/v1.0/me?$select=displayName,companyName,mail,userPrincipalName,entity,jobTitle,department,id,givenName,surname,officeLocation,surname,preferredLanguage',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )

        if (response.ok) {
          const profile = await response.json()
          await this.checkAdmin(profile.mail)
          this.user = {
            displayName: profile.displayName,
            email: profile.mail || profile.userPrincipalName,
            jobTitle: profile.jobTitle,
            department: profile.department,
            id: profile.id,
            entity: profile.companyName,
            entraAd: (profile.mail || profile.userPrincipalName).split('@')[0],
          }
          // this.user = {
          //   displayName: 'Edward',
          //   email: 'edward@tuaspower.com.sg',
          //   jobTitle: 'security guard',
          //   department: 'Security',
          //   id: profile.id,
          //   entity: profile.companyName,
          //   entraAd: 'edward@tuaspower.com.sg'.split('@')[0],
          // }

          return this.user
        } else {
          throw new Error(`Failed to fetch profile: ${response.status}`)
        }
      } catch (error: any) {
        console.error('Failed to fetch user profile:', error)
        this.error = error.message || 'Failed to load user profile'
        throw error
      }
    },

    async getAccessToken(scopes?: string[]) {
      try {
        const accounts = msalInstance.getAllAccounts()
        if (accounts.length === 0) {
          throw new Error('No accounts found')
        }

        const tokenRequest = {
          ...loginRequest,
          account: accounts[0],
          scopes: scopes || this.accessTokenScopes,
        }

        const response = await msalInstance.acquireTokenSilent(tokenRequest)
        return response.accessToken
      } catch (error: any) {
        console.error('Silent token acquisition failed:', error)
        try {
          const tokenRequest = {
            ...loginRequest,
            scopes: scopes || this.accessTokenScopes,
          }
          const response = await msalInstance.acquireTokenPopup(tokenRequest)
          return response.accessToken
        } catch (popupError: any) {
          console.error('Interactive token acquisition failed:', popupError)
          this.error = popupError.message || 'Failed to acquire access token'
          throw popupError
        }
      }
    },
    async checkAdmin(upn: string) {
      try {
        const response = await apiClient.post('/adminaccess/check_access', {
          user_upn: upn,
        })

        const data = response.data
        this.isAdmin = data.access
        console.log('isAdmin', this.isAdmin)
      } catch (err: any) {
        console.log('Error checking admin access:', err)
        this.isAdmin = false

      }
    }
    ,


    // hasRole(role: string): boolean {
    //   if (!this.userAccount) return false
    //   return false
    // },

    // Reset store to initial state
    reset() {
      this.userAccount = null
      this.user = null
      this.isAuthenticated = false
      this.error = null
    },

    // Clear error message
    clearError() {
      this.error = null
    },
  },

  // Uncomment if using pinia-plugin-persistedstate
  // persist: {
  //   key: 'auth-store',
  //   storage: localStorage,
  //   paths: ['isAuthenticated', 'userAccount']
  // }
})
