import type { Configuration } from '@azure/msal-browser'

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URL, // Optional for popup flow
    postLogoutRedirectUri:
      import.meta.env.VITE_AZURE_REDIRECT_URL?.replace('/auth/callback', '') ||
      window.location.origin,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'localStorage', // Use localStorage to persist tokens
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: any, message: any, containsPii: any) => {
        if (!containsPii) {
          console.log(`[MSAL] ${level}: ${message}`)
        }
      },
      logLevel: 2, // LogLevel.Verbose = 2
      piiLoggingEnabled: false,
    },
  },
}

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'offline_access'],
  // Request refresh tokens for longer sessions
  prompt: 'select_account', // Allow user to select account
}

export const tokenRequest = {
  scopes: ['User.Read', 'offline_access'],
  account: null,
}
