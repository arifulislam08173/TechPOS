import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Eye, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { inventoryApi } from '../../api/inventory'
import { useAuth } from '../../auth/AuthProvider'
import { Permissions } from '../../auth/permissions'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import type { StockTransactionType } from '../../types/inventory'

export function InventoryPage() {
  const { hasPermission } = useAuth()
  const canManage = hasPermission(Permissions.inventoryManage)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<StockTransactionType | ''>('')
  const debouncedSearch = useDebouncedValue(search)
  const query = { page, pageSize: 10, search: debouncedSearch || undefined, type: type || undefined }

  const history = useQuery({
    queryKey: ['inventory-history', query],
    queryFn: () => inventoryApi.history(query),
    placeholderData: keepPreviousData,
  })

  const toneForType = (value: StockTransactionType) =>
    value === 'StockIn' || value === 'AdjustmentIncrease' || value === 'Return'
      ? 'green'
      : value === 'Sale'
        ? 'blue'
        : 'slate'

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Audited stock movements with backend-controlled balances and immutable history."
        actions={canManage ? <Link to="/inventory/new"><Button><Plus size={16} />New stock operation</Button></Link> : undefined}
      />

      <Card>
        <div className="flex flex-wrap gap-3 border-b border-slate-200 p-4">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1) }}
              placeholder="Search product or SKU…"
              className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select
            value={type}
            onChange={(event) => { setType(event.target.value as StockTransactionType | ''); setPage(1) }}
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">All movements</option>
            <option value="StockIn">Stock in</option>
            <option value="StockOut">Stock out</option>
            <option value="AdjustmentIncrease">Adjustment increase</option>
            <option value="AdjustmentDecrease">Adjustment decrease</option>
            <option value="Sale">Sale</option>
            <option value="Return">Return</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {history.data?.items.length ? (
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Movement</th>
                  <th className="px-5 py-3">Quantity</th>
                  <th className="px-5 py-3">Balance</th>
                  <th className="px-5 py-3">Note</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-900">{item.productName}</p>
                      <p className="text-xs text-slate-500">{item.sku}</p>
                    </td>
                    <td className="px-5 py-3"><Badge tone={toneForType(item.type)}>{item.type}</Badge></td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-800">{item.quantity}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{item.stockBefore} → {item.stockAfter}</td>
                    <td className="max-w-[280px] truncate px-5 py-3 text-sm text-slate-500">{item.note || '—'}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end">
                        <Link to={`/inventory/${item.id}`} title="View transaction" className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
                          <Eye size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <EmptyState title="No stock movements found" description="Create a stock operation or adjust your filters." />}
        </div>

        {history.data && (
          <Pagination page={page} totalPages={history.data.totalPages} totalItems={history.data.totalItems} onPageChange={setPage} />
        )}
      </Card>
    </>
  )
}
