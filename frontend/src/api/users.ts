import { api } from './client'
import type { PagedResult } from '../types/api'
import type { User, UserQuery } from '../types/user'

export const usersApi = {
  list: async (query: UserQuery) =>
    (await api.get<PagedResult<User>>('/users', { params: query })).data,

  get: async (id: number) => (await api.get<User>(`/users/${id}`)).data,

  create: async (body: { fullName: string; email: string; role: string; password: string }) =>
    (await api.post<User>('/users', body)).data,

  update: async (id: number, body: { fullName: string; email: string; role: string; isActive: boolean }) =>
    (await api.put<User>(`/users/${id}`, body)).data,

  resetPassword: async (id: number, body: { newPassword: string; confirmPassword: string }) =>
    (await api.post<{ message: string }>(`/users/${id}/reset-password`, body)).data,
}
