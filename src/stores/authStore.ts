import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { User, AdminAccount } from '@/types/index.ts'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const admin = ref<AdminAccount | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => !!admin.value)
  //action
  const login = () => {
    user.value = {
      _id: '1',
      fullname: 'John Doe',
      entraAD: 'johndoe',
      department: 'IT',
    }
    isLoading.value = false
    error.value = null
  }

  const logout = () => {
    user.value = null
    admin.value = null
  }
  return {
    user,
    admin,
    logout,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    login,
  }
})
