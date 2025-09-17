import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { msalInstance } from './msal.ts'
import { tokenRequest } from '../config/msalConfig'
import type { SilentRequest } from '@azure/msal-browser'

const API_BASE_URL: string = import.meta.env.VITE_BACKEND_URL

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    try {
      const accounts = msalInstance.getAllAccounts()
      if (accounts.length > 0) {
        const silentTokenRequest = tokenRequest as unknown as SilentRequest
        silentTokenRequest.account = accounts[0]
        const response = await msalInstance.acquireTokenSilent(silentTokenRequest)

        if (!config.headers) {
          config.headers = new AxiosHeaders()
        }
        if (typeof (config.headers as any).set === 'function') {
          ;(config.headers as AxiosHeaders).set(
            'Authorization',
            `Bearer ${response.accessToken ? import.meta.env.VITE_ACCESS_TOKEN : ''}`,
          )
        } else {
          ;(config.headers as Record<string, string>)['Authorization'] =
            `Bearer ${response.accessToken ? import.meta.env.VITE_ACCESS_TOKEN : ''}`
        }
      }
    } catch (error) {
      console.error('Token acquisition failed:', error)
    }
    return config
  },
)

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      try {
        const accounts = msalInstance.getAllAccounts()
        if (accounts.length > 0 && error.config) {
          const silentTokenRequest = tokenRequest as unknown as SilentRequest
          silentTokenRequest.account = accounts[0]
          await msalInstance.acquireTokenSilent(silentTokenRequest)
          return apiClient.request(error.config)
        }
      } catch {
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
