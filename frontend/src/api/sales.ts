import { api } from './client'
import type { CreateSaleInput, Sale, SalePage, SaleQuery } from '../types/sale'

export const salesApi = {
  list: async (query: SaleQuery = {}) => {
    const { data } = await api.get<SalePage>('/sales', { params: query })
    return data
  },
  get: async (id: number) => {
    const { data } = await api.get<Sale>(`/sales/${id}`)
    return data
  },
  create: async (input: CreateSaleInput) => {
    const { data } = await api.post<Sale>('/sales', input)
    return data
  },
}
