import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Printer } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { salesApi } from '../../api/sales'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { formatCurrency, formatDateTime } from '../../utils/format'

export function SaleDetailsPage() {
  const { id } = useParams()
  const saleId = Number(id)
  const sale = useQuery({ queryKey: ['sale', saleId], queryFn: () => salesApi.get(saleId), enabled: Number.isFinite(saleId) && saleId > 0 })

  if (sale.isLoading) return <Card className="h-64 animate-pulse bg-slate-100" />
  if (!sale.data) return <Card className="p-8 text-center text-sm text-slate-500">Sale not found.</Card>

  const data = sale.data
  return (
    <div className="print:bg-white">
      <div className="print:hidden">
        <PageHeader
          title={data.invoiceNumber}
          subtitle="Sale details and print-ready invoice."
          actions={<><Link to="/sales"><Button variant="secondary"><ArrowLeft size={16} />Back</Button></Link><Button onClick={() => window.print()}><Printer size={16} />Print invoice</Button></>}
        />
      </div>

      <Card className="print:border-0 print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 p-6">
          <div><p className="text-xl font-bold text-slate-950">TechPOS</p><p className="mt-1 text-sm text-slate-500">Computer Shop POS & Inventory Management</p></div>
          <div className="text-right"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Invoice</p><p className="mt-1 text-lg font-semibold text-slate-950">{data.invoiceNumber}</p><p className="mt-1 text-xs text-slate-500">{formatDateTime(data.createdAt)}</p></div>
        </div>

        <div className="grid gap-4 border-b border-slate-100 p-6 sm:grid-cols-3">
          <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Cashier</p><p className="mt-1 text-sm font-medium text-slate-900">{data.cashierName}</p><p className="text-xs text-slate-500">{data.cashierEmail}</p></div>
          <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Payment</p><div className="mt-2"><Badge tone="blue">{data.paymentMethod === 'MobileBanking' ? 'Mobile banking' : data.paymentMethod}</Badge></div></div>
          <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Items</p><p className="mt-1 text-sm font-medium text-slate-900">{data.items.reduce((sum, item) => sum + item.quantity, 0)} unit(s)</p></div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead><tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><th className="px-6 py-3">Product</th><th className="px-6 py-3">Qty</th><th className="px-6 py-3">Unit price</th><th className="px-6 py-3 text-right">Line total</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((item) => <tr key={item.id}><td className="px-6 py-3"><p className="text-sm font-medium text-slate-900">{item.productName}</p><p className="text-xs text-slate-500">{item.sku}</p></td><td className="px-6 py-3 text-sm text-slate-600">{item.quantity}</td><td className="px-6 py-3 text-sm text-slate-600">{formatCurrency(item.unitPrice)}</td><td className="px-6 py-3 text-right text-sm font-medium text-slate-900">{formatCurrency(item.lineTotal)}</td></tr>)}
            </tbody>
          </table>
        </div>

        <div className="ml-auto w-full max-w-sm space-y-2 border-t border-slate-200 p-6 text-sm">
          <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(data.subtotal)}</span></div>
          <div className="flex justify-between text-slate-600"><span>Discount</span><span>- {formatCurrency(data.discountAmount)}</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-950"><span>Grand total</span><span>{formatCurrency(data.grandTotal)}</span></div>
          <div className="flex justify-between text-slate-600"><span>Amount paid</span><span>{formatCurrency(data.amountPaid)}</span></div>
          {data.changeAmount > 0 && <div className="flex justify-between text-emerald-700"><span>Change</span><span>{formatCurrency(data.changeAmount)}</span></div>}
        </div>

        {data.note && <div className="border-t border-slate-100 px-6 py-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Note</p><p className="mt-1 text-sm text-slate-600">{data.note}</p></div>}
      </Card>
    </div>
  )
}
