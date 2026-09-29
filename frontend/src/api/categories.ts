import { api } from './client'
import type { PagedResult } from '../types/api'
import type { Category, CategoryQuery } from '../types/category'

export const categoriesApi = {
  list: async (query: CategoryQuery) =>
    (await api.get<PagedResult<Category>>('/categories', { params: query })).data,

  lookup: async () => (await api.get<Category[]>('/categories/lookup')).data,

  get: async (id: number) => (await api.get<Category>(`/categories/${id}`)).data,

  create: async (body: { name: string }) =>
    (await api.post<Category>('/categories', body)).data,

  update: async (id: number, body: { name: string; isActive: boolean }) =>
    (await api.put<Category>(`/categories/${id}`, body)).data,

  remove: async (id: number) => {
    await api.delete(`/categories/${id}`)
  },
}
