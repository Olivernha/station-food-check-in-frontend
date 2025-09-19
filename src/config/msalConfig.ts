export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URL,
    postLogoutRedirectUri:
      import.meta.env.VITE_AZURE_REDIRECT_URL?.replace('/auth/callback', '') ||
      window.location.origin,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    windowHashTimeout: 60000,
    iframeHashTimeout: 6000,
    loadFrameTimeout: 0,
    redirectNavigationTimeout: 20000,
    asyncPopups: false,
    allowNativeBroker: false,
    allowRedirectInIframe: false, // Important for history mode
    loggerOptions: {
      loggerCallback: (level: any, message: any, containsPii: any) => {
        if (!containsPii) {
          console.log(`[MSAL] ${level}: ${message}`)
        }
      },
      logLevel: 'Info', // Change to 'Verbose' for debugging
      piiLoggingEnabled: false,
    },
  },
}

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile'],
  extraQueryParameters: {
    response_mode: 'query'
  }
}

export const tokenRequest = {
  scopes: [`User.Read`],
  account: null,
}
