import type { PagedResult } from './api'

export type PaymentMethod = 'Cash' | 'Card' | 'MobileBanking'

export type SaleListItem = {
  id: number
  invoiceNumber: string
  cashierName: string
  itemCount: number
  subtotal: number
  discountAmount: number
  grandTotal: number
  paymentMethod: PaymentMethod
  createdAt: string
}

export type SaleItem = {
  id: number
  productId: number
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type Sale = {
  id: number
  invoiceNumber: string
  cashierId: number
  cashierName: string
  cashierEmail: string
  subtotal: number
  discountAmount: number
  grandTotal: number
  paymentMethod: PaymentMethod
  amountPaid: number
  changeAmount: number
  note?: string | null
  createdAt: string
  items: SaleItem[]
}

export type SaleQuery = {
  page?: number
  pageSize?: number
  search?: string
  paymentMethod?: PaymentMethod
  cashierId?: number
  fromDate?: string
  toDate?: string
}

export type CreateSaleInput = {
  items: Array<{ productId: number; quantity: number }>
  discountAmount: number
  paymentMethod: PaymentMethod
  amountPaid: number
  note?: string
}

export type SalePage = PagedResult<SaleListItem>
