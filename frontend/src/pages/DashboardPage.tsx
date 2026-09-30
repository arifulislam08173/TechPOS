import { useQuery } from '@tanstack/react-query'
import { Boxes, PackageCheck, ReceiptText, ShoppingCart, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { reportsApi } from '../api/reports'
import { useAuth } from '../auth/AuthProvider'
import { Permissions } from '../auth/permissions'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardHeader } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { formatCurrency, formatDateTime } from '../utils/format'

export function DashboardPage() {
  const { hasPermission } = useAuth()
  const canDashboard = hasPermission(Permissions.dashboardView)
  const canSell = hasPermission(Permissions.salesManage)
  const canViewSales = hasPermission(Permissions.salesView)

  const dashboard = useQuery({
    queryKey: ['dashboard'],
    queryFn: reportsApi.dashboard,
    enabled: canDashboard,
  })

  if (!canDashboard) {
    return <Card className="p-8"><p className="text-sm font-semibold text-slate-900">Dashboard access is not assigned to your role.</p><p className="mt-2 text-sm text-slate-500">Use the navigation items available for your current permissions.</p></Card>
  }

  const data = dashboard.data
  const cards = [
    ['Today sales', data ? formatCurrency(data.todaySales) : '—', ShoppingCart],
    ['Today orders', data?.todayOrders ?? '—', ReceiptText],
    ['Items sold', data?.todayItemsSold ?? '—', PackageCheck],
    ['Active products', data?.totalProducts ?? '—', Boxes],
  ] as const

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Live operational overview of today’s sales and inventory health."
        actions={canSell ? <Link to="/pos"><Button><ShoppingCart size={16} />Open POS</Button></Link> : undefined}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon]) => <Card key={label} className="p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p></div><div className="rounded-xl bg-slate-100 p-2.5 text-slate-600"><Icon size={20} /></div></div></Card>)}
      </div>

      <div className="mt-4">
        <Card className="p-5"><div className="flex items-center gap-4"><div className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-700"><TriangleAlert size={20} /></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Low-stock attention</p><p className="mt-1 text-xl font-semibold text-slate-950">{data?.lowStockCount ?? '—'} product(s)</p></div></div></Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Recent sales" subtitle="Latest completed POS transactions" />
          <div className="divide-y divide-slate-100">
            {data?.recentSales.length ? data.recentSales.map((sale) => (
              <Link key={sale.id} to={canViewSales ? `/sales/${sale.id}` : '#'} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-slate-50">
                <div><p className="text-sm font-medium text-slate-900">{sale.invoiceNumber}</p><p className="mt-0.5 text-xs text-slate-500">{sale.cashierName} · {formatDateTime(sale.createdAt)}</p></div>
                <div className="text-right"><p className="text-sm font-semibold text-slate-900">{formatCurrency(sale.grandTotal)}</p><p className="mt-0.5 text-xs text-slate-500">{sale.paymentMethod === 'MobileBanking' ? 'Mobile banking' : sale.paymentMethod}</p></div>
              </Link>
            )) : <div className="px-5 py-12 text-center text-sm text-slate-400">No sales have been completed yet.</div>}
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Low-stock products" subtitle="Restock priority based on configured thresholds" />
          <div className="divide-y divide-slate-100">
            {data?.lowStockProducts.length ? data.lowStockProducts.map((item) => <div key={item.productId} className="flex items-center justify-between gap-4 px-5 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-900">{item.productName}</p><p className="text-xs text-slate-500">{item.sku} · threshold {item.lowStockThreshold}</p></div><Badge tone={item.stockQuantity === 0 ? 'red' : 'amber'}>{item.stockQuantity} left</Badge></div>) : <div className="px-5 py-12 text-center text-sm text-slate-400">Inventory levels look healthy.</div>}
          </div>
        </Card>
      </div>
    </>
  )
}
