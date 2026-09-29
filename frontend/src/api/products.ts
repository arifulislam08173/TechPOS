import { api } from './client'; import type { PagedResult } from '../types/api'; import type { Product, ProductInput, ProductQuery } from '../types/product'
export const productsApi = {
  list: async (query:ProductQuery) => (await api.get<PagedResult<Product>>('/products',{params:query})).data,
  get: async (id:number) => (await api.get<Product>(`/products/${id}`)).data,
  create: async (body:ProductInput) => (await api.post<Product>('/products',body)).data,
  update: async (id:number, body:ProductInput & {isActive:boolean}) => (await api.put<Product>(`/products/${id}`,body)).data,
  deactivate: async (id:number) => { await api.delete(`/products/${id}`) }
}
