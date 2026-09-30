import { useQuery } from '@tanstack/react-query'
import { BarChart3, Boxes, Download, DollarSign, FileText, PackageCheck, ReceiptText, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { reportsApi } from '../../api/reports'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { exportReportCsv, exportReportPdf } from '../../utils/reportExport'
import { formatCurrency, toDateInput } from '../../utils/format'

export function ReportsPage() {
  const today = useMemo(() => new Date(), [])
  const initialFrom = useMemo(() => {
    const date = new Date(today)
    date.setDate(date.getDate() - 29)
    return toDateInput(date)
  }, [today])

  const [fromDate, setFromDate] = useState(initialFrom)
  const [toDate, setToDate] = useState(toDateInput(today))

  const report = useQuery({
    queryKey: ['reports-overview', fromDate, toDate],
    queryFn: () => reportsApi.overview(fromDate, toDate),
  })

  const data = report.data
  const maxSales = Math.max(...(data?.salesTrend.map((point) => point.sales) ?? [0]), 1)

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Sales performance, profitability and inventory health from backend-driven report queries."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm" />
            <span className="text-xs text-slate-400">to</span>
            <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm" />
            <Button type="button" variant="secondary" disabled={!data || report.isFetching} onClick={() => data && exportReportCsv(data)}>
              <Download size={15} />CSV
            </Button>
            <Button type="button" variant="secondary" disabled={!data || report.isFetching} onClick={() => data && exportReportPdf(data)}>
              <FileText size={15} />PDF
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total sales" value={data ? formatCurrency(data.totalSales) : '—'} icon={DollarSign} />
        <Metric label="Orders" value={data?.orders ?? '—'} icon={ReceiptText} />
        <Metric label="Items sold" value={data?.itemsSold ?? '—'} icon={PackageCheck} />
        <Metric label="Gross profit" value={data ? formatCurrency(data.grossProfit) : '—'} icon={TrendingUp} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Metric label="Average order value" value={data ? formatCurrency(data.averageOrderValue) : '—'} icon={BarChart3} />
        <Metric
          label="Inventory retail value"
          value={data ? formatCurrency(data.inventoryRetailValue) : '—'}
          icon={Boxes}
          subtitle={data ? `Cost value ${formatCurrency(data.inventoryCostValue)}` : undefined}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Sales trend" subtitle="Daily sales for the selected period" />
          <div className="overflow-x-auto p-5">
            {data?.salesTrend.length ? (
              <div className="flex min-w-[640px] items-end gap-2" style={{ height: 260 }}>
                {data.salesTrend.map((point) => {
                  const height = Math.max((point.sales / maxSales) * 190, 4)
                  return (
                    <div key={point.date} className="group flex min-w-10 flex-1 flex-col items-center justify-end">
                      <div className="mb-2 hidden rounded-lg bg-slate-900 px-2 py-1 text-[10px] text-white group-hover:block">
                        {formatCurrency(point.sales)} · {point.orders} order(s)
                      </div>
                      <div className="w-full rounded-t-lg bg-blue-500/85 transition group-hover:bg-blue-600" style={{ height }} />
                      <p className="mt-2 rotate-[-35deg] whitespace-nowrap text-[10px] text-slate-400">{point.date.slice(5)}</p>
                    </div>
                  )
                })}
              </div>
            ) : <div className="py-16 text-center text-sm text-slate-400">No sales in this date range.</div>}
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Top products" subtitle="Ranked by units sold" />
          <div className="divide-y divide-slate-100">
            {data?.topProducts.length ? data.topProducts.map((item, index) => (
              <div key={item.productId} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">{index + 1}</div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{item.productName}</p>
                    <p className="text-xs text-slate-500">{item.sku} · {item.quantitySold} sold</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.revenue)}</p>
              </div>
            )) : <div className="px-5 py-12 text-center text-sm text-slate-400">No product sales yet.</div>}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Low stock" subtitle="Products at or below their configured threshold" />
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Product</th><th className="px-5 py-3">SKU</th><th className="px-5 py-3">Stock</th><th className="px-5 py-3">Threshold</th><th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.lowStockProducts.length ? data.lowStockProducts.map((item) => (
                <tr key={item.productId}>
                  <td className="px-5 py-3 text-sm font-medium text-slate-900">{item.productName}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{item.sku}</td>
                  <td className="px-5 py-3 text-sm text-slate-700">{item.stockQuantity}</td>
                  <td className="px-5 py-3 text-sm text-slate-700">{item.lowStockThreshold}</td>
                  <td className="px-5 py-3"><Badge tone={item.stockQuantity === 0 ? 'red' : 'amber'}>{item.stockQuantity === 0 ? 'Out of stock' : 'Low stock'}</Badge></td>
                </tr>
              )) : <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">No low-stock products.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

function Metric({ label, value, icon: Icon, subtitle }: { label: string; value: string | number; icon: typeof DollarSign; subtitle?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600"><Icon size={20} /></div>
      </div>
    </Card>
  )
}
