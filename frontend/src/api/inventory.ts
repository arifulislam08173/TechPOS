import { api } from './client'; import type { PagedResult } from '../types/api'; import type { InventoryQuery, StockTransaction } from '../types/inventory'
export const inventoryApi = {
  history: async (query:InventoryQuery) => (await api.get<PagedResult<StockTransaction>>('/inventory/history',{params:query})).data,
  stockIn: async (body:{productId:number;quantity:number;note?:string}) => (await api.post<StockTransaction>('/inventory/stock-in',body)).data,
  stockOut: async (body:{productId:number;quantity:number;reason:string}) => (await api.post<StockTransaction>('/inventory/stock-out',body)).data,
  adjust: async (body:{productId:number;newQuantity:number;reason:string}) => (await api.post<StockTransaction>('/inventory/adjust',body)).data,
}
