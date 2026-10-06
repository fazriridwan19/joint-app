import axios from 'axios'
import type { ApiError, ApiResponse } from '../types/api'

export const api = axios.create({
  baseURL: import.meta.env.BACKEND_BASE_URL ?? 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request interceptor — attach access token ────────────────────────────────

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('job-tracker.access-token')
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  config.headers['Accept-Language'] = 'id'
  return config
})

// ─── Token refresh state ──────────────────────────────────────────────────────

let isRefreshing = false

// Queue of { resolve, reject } for requests that arrived while a refresh was in flight
type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void }
let pendingQueue: QueueEntry[] = []

function flushQueue(token: string) {
  pendingQueue.forEach(({ resolve }) => resolve(token))
  pendingQueue = []
}

function rejectQueue(err: unknown) {
  pendingQueue.forEach(({ reject }) => reject(err))
  pendingQueue = []
}

// ─── Response interceptor — handle 401 with silent token refresh ──────────────

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error)

    const originalRequest = error.config
    const status = error.response?.status
    const errorCode = (error.response?.data as ApiResponse<unknown>)?.error?.code

    // Only handle 401 that is NOT from the auth endpoints themselves
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh')

    if (status !== 401 || isAuthEndpoint) {
      return Promise.reject(error)
    }

    // SESSION_REVOKED means the refresh token itself was invalidated — force logout
    if (errorCode === 'SESSION_REVOKED') {
      clearSessionAndRedirect()
      return Promise.reject(error)
    }

    // If a refresh is already in flight, queue this request until it resolves
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (newToken) => {
            if (originalRequest) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              resolve(api(originalRequest))
            }
          },
          reject,
        })
      })
    }

    // This request is the first 401 — kick off the refresh
    isRefreshing = true

    const refreshToken = localStorage.getItem('job-tracker.refresh-token')
    if (!refreshToken) {
      isRefreshing = false
      clearSessionAndRedirect()
      return Promise.reject(error)
    }

    try {
      const res = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
        `${api.defaults.baseURL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      )

      const tokens = res.data.data
      if (!tokens?.accessToken) throw new Error('Empty token response')

      localStorage.setItem('job-tracker.access-token', tokens.accessToken)
      localStorage.setItem('job-tracker.refresh-token', tokens.refreshToken)

      // Update auth store user state without triggering a full restoreSession
      // (import is deferred to avoid circular dependency)
      void import('../features/auth/model/auth-store').then(({ useAuthStore }) => {
        const state = useAuthStore.getState()
        if (!state.user) void state.restoreSession()
      })

      flushQueue(tokens.accessToken)

      // Retry the original request with the new token
      if (originalRequest) {
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`
        return api(originalRequest)
      }
    } catch (refreshError) {
      rejectQueue(refreshError)
      clearSessionAndRedirect()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clearSessionAndRedirect() {
  localStorage.removeItem('job-tracker.access-token')
  localStorage.removeItem('job-tracker.refresh-token')
  // Update Zustand store so RequireAuth redirects to /auth
  void import('../features/auth/model/auth-store').then(({ useAuthStore }) => {
    useAuthStore.setState({ user: null })
  })
}

export function getApiError(error: unknown): ApiError | null {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    const responseError = error.response?.data?.error
    if (responseError?.message) return responseError

    if (!error.response) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internetmu lalu coba lagi.',
        details: null,
        requestId: '',
      }
    }

    return {
      code: `HTTP_${error.response.status}`,
      message: 'Permintaan gagal diproses. Coba lagi.',
      details: null,
      requestId: '',
    }
  }

  if (error instanceof Error && error.message) {
    return {
      code: 'CLIENT_ERROR',
      message: error.message,
      details: null,
      requestId: '',
    }
  }

  return null
}

export function getApiMessage(error: unknown) {
  return getApiError(error)?.message ?? 'Terjadi kesalahan. Coba lagi.'
}
