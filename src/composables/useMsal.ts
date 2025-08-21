// composables/useMsal.ts
import { ref, onMounted } from 'vue'
import { PublicClientApplication, LogLevel, type AccountInfo, type AuthenticationResult } from '@azure/msal-browser'
import { useAuthStore } from '../stores/authStore'

// Types
interface MsalConfig {
  clientId: string
  tenantId: string
  redirectUri?: string
  scopes?: string[]
}

interface UserInfo {
  displayName?: string
  email?: string
  jobTitle?: string
  department?: string
  id?: string
}

export function useMsal(config: MsalConfig) {
  const authStore = useAuthStore()

  // Reactive state
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref('')
  const msalInstance = ref<PublicClientApplication | null>(null)

  // Default configuration
  const defaultScopes = ['User.Read', 'User.ReadBasic.All']
  const scopes = config.scopes || defaultScopes

  // MSAL Configuration
  const msalConfig = {
    auth: {
      clientId: config.clientId,
      authority: `https://login.microsoftonline.com/${config.tenantId}`,
      redirectUri: config.redirectUri || window.location.origin,
    },
    cache: {
      cacheLocation: 'sessionStorage' as const,
      storeAuthStateInCookie: false,
    },
    system: {
      loggerOptions: {
        loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
          if (containsPii) return
          switch (level) {
            case LogLevel.Error:
              console.error('[MSAL]', message)
              break
            case LogLevel.Info:
              console.info('[MSAL]', message)
              break
            case LogLevel.Verbose:
              console.debug('[MSAL]', message)
              break
            case LogLevel.Warning:
              console.warn('[MSAL]', message)
              break
          }
        },
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false
      }
    }
  }

  // Initialize MSAL
  const initialize = async (): Promise<void> => {
    if (isInitialized.value) return

    try {
      isLoading.value = true
      error.value = ''

      // Create MSAL instance
      msalInstance.value = new PublicClientApplication(msalConfig)
      await msalInstance.value.initialize()

      // Set MSAL instance in auth store
      authStore.setMsalInstance(msalInstance.value)

      // Handle redirect response
      await handleRedirectResponse()

      // Check for existing authentication
      await checkExistingAuthentication()

      isInitialized.value = true
      console.log('MSAL initialized successfully')
    } catch (err) {
      console.error('MSAL initialization failed:', err)
      error.value = err instanceof Error ? err.message : 'Failed to initialize authentication'
    } finally {
      isLoading.value = false
    }
  }

  // Handle redirect response
  const handleRedirectResponse = async (): Promise<AuthenticationResult | null> => {
    if (!msalInstance.value) throw new Error('MSAL not initialized')

    try {
      const response = await msalInstance.value.handleRedirectPromise()
      if (response) {
        console.log('Redirect authentication successful:', response)
        await processAuthenticationResult(response)
        return response
      }
      return null
    } catch (err) {
      console.error('Redirect handling failed:', err)
      error.value = 'Authentication failed'
      throw err
    }
  }

  // Check for existing authentication
  const checkExistingAuthentication = async (): Promise<boolean> => {
    if (!msalInstance.value) return false

    const accounts = msalInstance.value.getAllAccounts()
    if (accounts.length > 0) {
      console.log('Existing account found:', accounts[0])
      try {
        const userInfo = await getUserInfo(accounts[0])
        authStore.login({
          user: userInfo,
          account: accounts[0],
          isAuthenticated: true
        })
        return true
      } catch (err) {
        console.error('Failed to process existing account:', err)
        return false
      }
    }
    return false
  }

  // Sign in with redirect
  const signIn = async (): Promise<void> => {
    if (!msalInstance.value) throw new Error('MSAL not initialized')

    try {
      isLoading.value = true
      error.value = ''

      // Try silent authentication first
      const accounts = msalInstance.value.getAllAccounts()
      if (accounts.length > 0) {
        try {
          const response = await acquireTokenSilent(accounts[0])
          await processAuthenticationResult(response)
          return
        } catch (silentError) {
          console.log('Silent authentication failed, proceeding with redirect:', silentError)
        }
      }

      // Redirect authentication
      const loginRequest = {
        scopes,
        prompt: 'select_account' as const
      }

      await msalInstance.value.loginRedirect(loginRequest)
    } catch (err) {
      console.error('Sign in failed:', err)
      error.value = err instanceof Error ? err.message : 'Sign in failed'
      isLoading.value = false
    }
  }

  // Sign in with popup
  const signInPopup = async (): Promise<AuthenticationResult> => {
    if (!msalInstance.value) throw new Error('MSAL not initialized')

    try {
      isLoading.value = true
      error.value = ''

      const loginRequest = {
        scopes,
        prompt: 'select_account' as const
      }

      const response = await msalInstance.value.loginPopup(loginRequest)
      await processAuthenticationResult(response)
      return response
    } catch (err) {
      console.error('Popup sign in failed:', err)
      error.value = err instanceof Error ? err.message : 'Sign in failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Sign out
  const signOut = async (): Promise<void> => {
    if (!msalInstance.value) return

    try {
      isLoading.value = true

      const accounts = msalInstance.value.getAllAccounts()
      if (accounts.length > 0) {
        await msalInstance.value.logoutRedirect({
          account: accounts[0]
        })
      }

      // Clear auth store
      await authStore.logout()
    } catch (err) {
      console.error('Sign out failed:', err)
      error.value = 'Sign out failed'
    } finally {
      isLoading.value = false
    }
  }

  // Acquire token silently
  const acquireTokenSilent = async (account: AccountInfo): Promise<AuthenticationResult> => {
    if (!msalInstance.value) throw new Error('MSAL not initialized')

    const tokenRequest = {
      scopes,
      account
    }

    return await msalInstance.value.acquireTokenSilent(tokenRequest)
  }

  // Get access token
  const getAccessToken = async (): Promise<string | null> => {
    if (!msalInstance.value) return null

    const accounts = msalInstance.value.getAllAccounts()
    if (accounts.length === 0) return null

    try {
      const response = await acquireTokenSilent(accounts[0])
      return response.accessToken
    } catch (err) {
      console.error('Failed to get access token:', err)
      return null
    }
  }

  // Get user info from Microsoft Graph
  const getUserInfo = async (account: AccountInfo): Promise<UserInfo> => {
    try {
      const response = await acquireTokenSilent(account)

      const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${response.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (graphResponse.ok) {
        const userData = await graphResponse.json()
        return {
          displayName: userData.displayName,
          email: userData.mail || userData.userPrincipalName,
          jobTitle: userData.jobTitle,
          department: userData.department,
          id: userData.id
        }
      } else {
        // Fallback to account info
        return {
          displayName: account.name,
          email: account.username,
          id: account.localAccountId
        }
      }
    } catch (err) {
      console.error('Failed to get user info:', err)
      // Fallback to account info
      return {
        displayName: account.name,
        email: account.username,
        id: account.localAccountId
      }
    }
  }

  // Process authentication result
  const processAuthenticationResult = async (result: AuthenticationResult): Promise<void> => {
    try {
      const userInfo = await getUserInfo(result.account)

      authStore.login({
        user: userInfo,
        account: result.account,
        isAuthenticated: true
      })

      console.log('Authentication processed successfully')
    } catch (err) {
      console.error('Failed to process authentication result:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get all accounts
  const getAccounts = (): AccountInfo[] => {
    if (!msalInstance.value) return []
    return msalInstance.value.getAllAccounts()
  }

  // Check if user is authenticated
  const isAuthenticated = (): boolean => {
    return getAccounts().length > 0
  }

  return {
    // State
    isInitialized,
    isLoading,
    error,
    msal,

    // Methods
    initialize,
    handleRedirectResponse,
    checkExistingAuthentication,
    signIn,
    signInPopup,
    signOut,
    acquireTokenSilent,
    getAccessToken,
    getUserInfo,
    processAuthenticationResult,
    getAccounts,
    isAuthenticated
  }
  }
