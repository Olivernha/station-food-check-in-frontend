// src/services/apiService.ts
import axios, { type AxiosResponse } from 'axios'
import { msalService } from './msalService'

interface UserProfile {
  displayName: string
  mail: string
  userPrincipalName: string
  jobTitle?: string
  department?: string
  id: string
  [key: string]: any
}

const authService = msalService()

export function apiService() {
  // Helper to make authorized requests
  const authorizedRequest = async <T>(
    url: string,
  ): Promise<AxiosResponse<T>> => {
    const accessToken = import.meta.env.ACCESS_TOKEN
    return axios.get<T>(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  }

  // Get current logged-in user profile from Microsoft Graph
  const getUserProfile = async (): Promise<UserProfile> => {
    try {
      const response = await authorizedRequest<UserProfile>(
        'https://graph.microsoft.com/v1.0/me?$select=displayName,companyName,mail,userPrincipalName,entity,jobTitle,department,id,givenName,surname,officeLocation,surname,preferredLanguage',
      )
      console.log('User profile fetched:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Microsoft Graph error:', error.response?.data || error.message)
      throw error
    }
  }

  return {
    getUserProfile,
  }
}
