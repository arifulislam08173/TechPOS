import { api } from './client'
import type { CurrentUser, LoginResponse } from '../types/auth'

export const authApi = {
  login: async (email: string, password: string) =>
    (await api.post<LoginResponse>('/auth/login', { email, password })).data,

  me: async () => (await api.get<CurrentUser>('/auth/me')).data,

  updateProfile: async (body: { fullName: string; email: string }) =>
    (await api.put<CurrentUser>('/auth/profile', body)).data,

  changePassword: async (body: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => (await api.post<{ message: string }>('/auth/change-password', body)).data,
}
