import axios from 'axios'

export const AUTH_STORAGE_KEY = 'techpos-auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5259/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem(AUTH_STORAGE_KEY)
  if (raw) {
    const token = JSON.parse(raw)?.accessToken as string | undefined
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
      window.dispatchEvent(new Event('techpos:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export function getApiError(error: unknown, fallback = 'Something went wrong.') {
  if (!axios.isAxiosError(error)) return fallback
  const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined
  if (data?.message) return data.message
  const firstValidationError = data?.errors ? Object.values(data.errors).flat()[0] : undefined
  if (firstValidationError) return firstValidationError
  if (error.response?.status === 403) return 'You do not have permission to perform this action.'
  return fallback
}
