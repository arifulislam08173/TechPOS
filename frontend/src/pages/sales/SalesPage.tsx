import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Eye, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { salesApi } from '../../api/sales'
import { useAuth } from '../../auth/AuthProvider'
import { Permissions } from '../../auth/permissions'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import type { PaymentMethod } from '../../types/sale'
import { formatCurrency, formatDateTime, toDateInput } from '../../utils/format'

export function SalesPage() {
  const { hasPermission } = useAuth()
  const canSell = hasPermission(Permissions.salesManage)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState(toDateInput(new Date()))
  const debouncedSearch = useDebouncedValue(search, 300)

  const query = {
    page,
    pageSize: 10,
    search: debouncedSearch || undefined,
    paymentMethod: paymentMethod || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  }

  const sales = useQuery({
    queryKey: ['sales', query],
    queryFn: () => salesApi.list(query),
    placeholderData: keepPreviousData,
  })

  return (
    <>
      <PageHeader
        title="Sales"
        subtitle="Review completed POS transactions, payments and invoices."
        actions={canSell ? <Link to="/pos"><Button><Plus size={16} />New sale</Button></Link> : undefined}
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1) }}
              placeholder="Search invoice or cashier…"
              className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select value={paymentMethod} onChange={(event) => { setPaymentMethod(event.target.value as PaymentMethod | ''); setPage(1) }} className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm">
            <option value="">All payments</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="MobileBanking">Mobile banking</option>
          </select>
          <input type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1) }} className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm" />
          <input type="date" value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(1) }} className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm" />
        </div>

        <div className="overflow-x-auto">
          {sales.data?.items.length ? (
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Cashier</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.data.items.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3"><p className="text-sm font-semibold text-slate-900">{sale.invoiceNumber}</p><p className="text-xs text-slate-500">Discount {formatCurrency(sale.discountAmount)}</p></td>
                    <td className="px-5 py-3 text-sm text-slate-600">{formatDateTime(sale.createdAt)}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{sale.cashierName}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{sale.itemCount}</td>
                    <td className="px-5 py-3"><Badge tone="blue">{sale.paymentMethod === 'MobileBanking' ? 'Mobile banking' : sale.paymentMethod}</Badge></td>
                    <td className="px-5 py-3 text-sm font-semibold text-slate-900">{formatCurrency(sale.grandTotal)}</td>
                    <td className="px-5 py-3"><div className="flex justify-end"><Link to={`/sales/${sale.id}`} className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"><Eye size={15} /></Link></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <EmptyState title="No sales found" description="Completed POS transactions will appear here." />}
        </div>

        {sales.data && <Pagination page={page} totalPages={sales.data.totalPages} totalItems={sales.data.totalItems} onPageChange={setPage} />}
      </Card>
    </>
  )
}
