export type StockTransactionType = 'StockIn' | 'StockOut' | 'AdjustmentIncrease' | 'AdjustmentDecrease' | 'Sale' | 'Return'

export type StockTransaction = {
  id: number
  productId: number
  productName: string
  sku: string
  type: StockTransactionType
  quantity: number
  stockBefore: number
  stockAfter: number
  referenceType: string | null
  referenceId: number | null
  note: string | null
  createdAt: string
}

export type InventoryQuery = {
  page: number
  pageSize: number
  search?: string
  productId?: number
  type?: StockTransactionType
  fromDate?: string
  toDate?: string
}
