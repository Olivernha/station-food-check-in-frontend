import { PublicClientApplication } from '@azure/msal-browser'
import { msalConfig } from '../config/msalConfig'

// Create the MSAL instance
// IMPORTANT: This instance must be initialized before use by calling msalInstance.initialize()
export const msalInstance = new PublicClientApplication(msalConfig)
