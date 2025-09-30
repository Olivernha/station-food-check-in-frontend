export const msalConfig = {
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
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    windowHashTimeout: 60000,
    iframeHashTimeout: 6000,
    loadFrameTimeout: 0,
    redirectNavigationTimeout: 20000,
    asyncPopups: false,
    allowNativeBroker: false,
    allowRedirectInIframe: false,
    loggerOptions: {
      loggerCallback: (level: any, message: any, containsPii: any) => {
        if (!containsPii) {
          console.log(`[MSAL] ${level}: ${message}`)
        }
      },
      logLevel: 'Verbose', // Set to Verbose for debugging
      piiLoggingEnabled: false,
    },
  },
}

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile'],
  // Remove response_mode for popup flow
  // extraQueryParameters: {
  //   response_mode: 'query'
  // }
}

export const tokenRequest = {
  scopes: ['User.Read'],
  account: null,
}
