import { defineStore } from 'pinia'
import { authAPI } from '@/services/api'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref<unknown>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const initAuth = () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      isAuthenticated.value = true
    }
  }

  const login = async (username: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await authAPI.login(username, password)
      const { access, refresh } = response.data as { access: string; refresh: string }

      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      isAuthenticated.value = true

      return { success: true as const }
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { detail?: string } } }
      error.value = axErr.response?.data?.detail || 'Login failed'
      return { success: false as const, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    isAuthenticated.value = false
    user.value = null
  }

  const refreshToken = async (): Promise<boolean> => {
    const refresh = localStorage.getItem('refresh_token')
    if (!refresh) {
      logout()
      return false
    }

    try {
      const response = await authAPI.refresh(refresh)
      const { access } = response.data as { access: string }
      localStorage.setItem('access_token', access)
      return true
    } catch {
      logout()
      return false
    }
  }

  return {
    isAuthenticated,
    user,
    loading,
    error,
    initAuth,
    login,
    logout,
    refreshToken,
  }
})
