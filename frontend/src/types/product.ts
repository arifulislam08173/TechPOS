export type Product = {
  id: number; name: string; sku: string; brand: string | null; purchasePrice: number; sellingPrice: number;
  stockQuantity: number; lowStockThreshold: number; isLowStock: boolean; isActive: boolean;
  categoryId: number; categoryName: string; createdAt: string; updatedAt: string;
}
export type ProductQuery = { page: number; pageSize: number; search?: string; categoryId?: number; brand?: string; isActive?: boolean; sortBy?: string; sortDirection?: 'asc'|'desc' }
export type ProductInput = { name: string; sku: string; brand?: string; purchasePrice: number; sellingPrice: number; lowStockThreshold: number; categoryId: number; isActive?: boolean }
