import {
  PublicClientApplication,
  type Configuration,
  type AccountInfo,
  type AuthenticationResult,
} from '@azure/msal-browser'

// MSAL configuration
const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URL,
  },
  cache: {
    cacheLocation: 'localStorage',
  },
}

// Validate environment variables
if (!import.meta.env.VITE_AZURE_CLIENT_ID || !import.meta.env.VITE_AZURE_TENANT_ID) {
  console.error(
    'Missing required environment variables: VITE_AZURE_CLIENT_ID or VITE_AZURE_TENANT_ID',
  )
  throw new Error('Environment variables missing for MSAL configuration')
}

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig)

// Auth state
interface AuthState {
  isAuthenticated: boolean
  user: AccountInfo | null
}

const state: AuthState = {
  isAuthenticated: false,
  user: null,
}

export function msalService() {
  // Initialize MSAL
  const initialize = async (): Promise<void> => {
    try {
      await msalInstance.initialize()
      console.log('MSAL initialized successfully')
    } catch (error) {
      console.error('Initialization error:', error)
      throw new Error('Failed to initialize MSAL')
    }
  }

  // Login with redirect
  const login = async (): Promise<void> => {
    try {
      const loginRequest = { scopes: ['User.Read'] }
      await msalInstance.loginRedirect(loginRequest)
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error?.message || 'Login failed')
    }
  }

  // Logout
  const logout = (): void => {
    const account = msalInstance.getActiveAccount()
    if (account) {
      msalInstance.logoutRedirect({ account })
    }
    state.isAuthenticated = false
    state.user = null
  }

  // Handle redirect callback
  const handleRedirect = async (): Promise<void> => {
    try {
      const response = await msalInstance.handleRedirectPromise()
      const account = msalInstance.getAllAccounts()[0] || null

      if (account) {
        msalInstance.setActiveAccount(account)
      }

      state.isAuthenticated = !!account
      state.user = account

      if (response) {
        console.log('Redirect handled successfully:', response)
      }
    } catch (error: any) {
      console.error('Redirect error:', error)
      throw new Error(error?.message || 'Redirect handling failed')
    }
  }

  // ✅ Always get a valid token
  const getToken = async (scopes: string[] = ['User.Read']): Promise<string> => {
    try {
      const account = msalInstance.getActiveAccount()
      if (!account) {
        console.warn('⚠️ No active account found, redirecting to login...')
        await login()
        throw new Error('Redirecting for login')
      }

      const tokenRequest = { scopes, account }

      // Try silent first
      const tokenResponse: AuthenticationResult =
        await msalInstance.acquireTokenSilent(tokenRequest)
      return tokenResponse.accessToken
    } catch (error) {
      console.warn('⚠️ Silent token acquisition failed, redirecting...', error)
      const account = msalInstance.getActiveAccount()
      await msalInstance.acquireTokenRedirect({ scopes, account })
      throw new Error('Redirecting for re-authentication')
    }
  }

  // Get current active account
  const getActiveAccount = (): AccountInfo | null => {
    return msalInstance.getActiveAccount()
  }

  // Check auth status
  const isUserAuthenticated = (): boolean => {
    return !!msalInstance.getActiveAccount()
  }

  return {
    initialize,
    login,
    logout,
    handleRedirect,
    getToken,
    getActiveAccount,
    isUserAuthenticated,
  }
}
