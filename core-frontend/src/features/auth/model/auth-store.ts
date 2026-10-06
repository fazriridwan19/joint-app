import { create } from 'zustand'
import { api } from '../../../lib/api-client'
import type { ApiResponse, TokenResponse, User } from '../../../types/api'

type AuthState = {
  user: User | null
  isLoading: boolean
  isRestoring: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  restoreSession: () => Promise<void>
}

const saveTokens = (tokens: TokenResponse) => {
  localStorage.setItem('job-tracker.access-token', tokens.accessToken)
  localStorage.setItem('job-tracker.refresh-token', tokens.refreshToken)
}

const clearTokens = () => {
  localStorage.removeItem('job-tracker.access-token')
  localStorage.removeItem('job-tracker.refresh-token')
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isRestoring: true,

  restoreSession: async () => {
    const accessToken = localStorage.getItem('job-tracker.access-token')
    if (!accessToken) {
      set({ isRestoring: false })
      return
    }
    try {
      const res = await api.get<ApiResponse<User>>('/me')
      set({ user: res.data.data, isRestoring: false })
    } catch {
      // Token expired — try refresh
      const refreshToken = localStorage.getItem('job-tracker.refresh-token')
      if (!refreshToken) {
        clearTokens()
        set({ isRestoring: false })
        return
      }
      try {
        const res = await api.post<ApiResponse<TokenResponse>>('/auth/refresh', { refreshToken })
        if (res.data.data) {
          saveTokens(res.data.data)
          set({ user: res.data.data.user, isRestoring: false })
        } else {
          clearTokens()
          set({ isRestoring: false })
        }
      } catch {
        clearTokens()
        set({ isRestoring: false })
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const res = await api.post<ApiResponse<TokenResponse>>('/auth/login', { email, password })
      if (!res.data.data) throw new Error('Login response tidak valid')
      saveTokens(res.data.data)
      set({ user: res.data.data.user })
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true })
    try {
      await api.post('/auth/register', { email, password, name })
      const res = await api.post<ApiResponse<TokenResponse>>('/auth/login', { email, password })
      if (!res.data.data) throw new Error('Register response tidak valid')
      saveTokens(res.data.data)
      set({ user: res.data.data.user })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('job-tracker.refresh-token')
    try {
      if (refreshToken) await api.post('/auth/logout', { refreshToken })
    } finally {
      clearTokens()
      set({ user: null })
    }
  },
}))
