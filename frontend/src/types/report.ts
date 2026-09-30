export type LowStockProduct = {
  productId: number
  productName: string
  sku: string
  stockQuantity: number
  lowStockThreshold: number
}

export type DashboardRecentSale = {
  id: number
  invoiceNumber: string
  cashierName: string
  grandTotal: number
  paymentMethod: string
  createdAt: string
}

export type DashboardSummary = {
  todaySales: number
  todayOrders: number
  todayItemsSold: number
  totalProducts: number
  lowStockCount: number
  recentSales: DashboardRecentSale[]
  lowStockProducts: LowStockProduct[]
}

export type SalesTrendPoint = {
  date: string
  sales: number
  orders: number
}

export type TopProduct = {
  productId: number
  productName: string
  sku: string
  quantitySold: number
  revenue: number
}

export type ReportOverview = {
  fromDate: string
  toDate: string
  totalSales: number
  orders: number
  itemsSold: number
  averageOrderValue: number
  grossProfit: number
  inventoryCostValue: number
  inventoryRetailValue: number
  salesTrend: SalesTrendPoint[]
  topProducts: TopProduct[]
  lowStockProducts: LowStockProduct[]
}
