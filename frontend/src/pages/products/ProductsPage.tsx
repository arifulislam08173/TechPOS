import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit3, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { productsApi } from '../../api/products'
import { categoriesApi } from '../../api/categories'
import { getApiError } from '../../api/client'
import { useAuth } from '../../auth/AuthProvider'
import { Permissions } from '../../auth/permissions'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Pagination } from '../../components/ui/Pagination'
import { EmptyState } from '../../components/ui/EmptyState'

export function ProductsPage() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuth()
  const canManage = hasPermission(Permissions.productsManage)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [status, setStatus] = useState('true')

  const query = {
    page,
    pageSize: 10,
    search: search || undefined,
    categoryId,
    isActive: status === '' ? undefined : status === 'true',
    sortBy: 'name',
    sortDirection: 'asc' as const,
  }

  const products = useQuery({
    queryKey: ['products', query],
    queryFn: () => productsApi.list(query),
    placeholderData: keepPreviousData,
  })

  const categories = useQuery({ queryKey: ['category-lookup'], queryFn: categoriesApi.lookup })

  const deactivate = useMutation({
    mutationFn: productsApi.deactivate,
    onSuccess: () => {
      toast.success('Product deactivated')
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (error) => toast.error(getApiError(error)),
  })

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Manage computers, laptops, components and accessory catalog records."
        actions={
          canManage ? (
            <Link to="/products/new">
              <Button><Plus size={16} />New product</Button>
            </Link>
          ) : undefined
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1) }}
              placeholder="Search name, SKU or brand…"
              className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select
            value={categoryId ?? ''}
            onChange={(event) => { setCategoryId(event.target.value ? Number(event.target.value) : undefined); setPage(1) }}
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">All categories</option>
            {categories.data?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <select
            value={status}
            onChange={(event) => { setStatus(event.target.value); setPage(1) }}
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
            <option value="">All status</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {products.data?.items.length ? (
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Product</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th><th className="px-5 py-3">Status</th>{canManage && <th className="px-5 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.data.items.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3"><p className="text-sm font-medium text-slate-900">{product.name}</p><p className="text-xs text-slate-500">{product.sku}{product.brand ? ` · ${product.brand}` : ''}</p></td>
                    <td className="px-5 py-3 text-sm text-slate-600">{product.categoryName}</td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-800">৳{product.sellingPrice.toLocaleString()}</td>
                    <td className="px-5 py-3"><Badge tone={product.isLowStock ? 'amber' : 'green'}>{product.stockQuantity}</Badge></td>
                    <td className="px-5 py-3"><Badge tone={product.isActive ? 'green' : 'slate'}>{product.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    {canManage && (
                      <td className="px-5 py-3"><div className="flex justify-end gap-2">
                        <Link to={`/products/${product.id}/edit`} className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"><Edit3 size={15} /></Link>
                        {product.isActive && <button onClick={() => confirm('Deactivate this product?') && deactivate.mutate(product.id)} className="grid size-9 place-items-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>}
                      </div></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <EmptyState />}
        </div>
        {products.data && <Pagination page={page} totalPages={products.data.totalPages} totalItems={products.data.totalItems} onPageChange={setPage} />}
      </Card>
    </>
  )
}
