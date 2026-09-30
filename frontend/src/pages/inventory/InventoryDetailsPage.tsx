import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Boxes, ExternalLink, History } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { inventoryApi } from '../../api/inventory'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { formatDateTime } from '../../utils/format'
import type { StockTransactionType } from '../../types/inventory'

export function InventoryDetailsPage() {
  const { id } = useParams()
  const transactionId = Number(id)

  const transaction = useQuery({
    queryKey: ['inventory-transaction', transactionId],
    queryFn: () => inventoryApi.get(transactionId),
    enabled: Number.isFinite(transactionId),
  })

  if (!Number.isFinite(transactionId)) return <Navigate to="/inventory" replace />

  const toneForType = (value: StockTransactionType) =>
    value === 'StockIn' || value === 'AdjustmentIncrease' || value === 'Return'
      ? 'green'
      : value === 'Sale'
        ? 'blue'
        : 'slate'

  return (
    <>
      <PageHeader
        title="Inventory transaction"
        subtitle="Read-only audit record for a stock movement."
        actions={<Link to="/inventory"><Button variant="secondary"><ArrowLeft size={16} />Back</Button></Link>}
      />

      {transaction.isLoading ? (
        <Card className="p-8 text-sm text-slate-500">Loading transaction…</Card>
      ) : transaction.data ? (
        <div className="grid gap-6 xl:grid-cols-12">
          <Card className="xl:col-span-8">
            <CardHeader title="Movement details" subtitle="Immutable inventory audit information" />
            <div className="grid gap-6 p-5 md:grid-cols-2">
              <Detail label="Transaction ID" value={`#${transaction.data.id}`} />
              <Detail label="Product" value={transaction.data.productName} />
              <Detail label="SKU" value={transaction.data.sku} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Movement type</p>
                <div className="mt-2"><Badge tone={toneForType(transaction.data.type)}>{transaction.data.type}</Badge></div>
              </div>
              <Detail label="Quantity" value={String(transaction.data.quantity)} />
              <Detail label="Balance change" value={`${transaction.data.stockBefore} → ${transaction.data.stockAfter}`} />
              <Detail label="Created" value={formatDateTime(transaction.data.createdAt)} />
              <Detail label="Reference" value={transaction.data.referenceType ? `${transaction.data.referenceType}${transaction.data.referenceId ? ` #${transaction.data.referenceId}` : ''}` : '—'} />
              <div className="md:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Note / reason</p>
                <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{transaction.data.note || 'No note was recorded.'}</p>
              </div>
            </div>
          </Card>

          <Card className="h-fit xl:col-span-4">
            <CardHeader title="Audit context" subtitle="Traceability and linked records" />
            <div className="space-y-4 p-5">
              <Summary icon={<History size={18} />} label="Recorded balance" value={`${transaction.data.stockBefore} → ${transaction.data.stockAfter}`} />
              <Summary icon={<Boxes size={18} />} label="Product ID" value={`#${transaction.data.productId}`} />
              {transaction.data.referenceType === 'SALE' && transaction.data.referenceId && (
                <Link to={`/sales/${transaction.data.referenceId}`} className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-700 hover:bg-blue-100">
                  View linked sale <ExternalLink size={16} />
                </Link>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-8 text-sm text-red-600">Inventory transaction could not be loaded.</Card>
      )}
    </>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1.5 text-sm font-medium text-slate-900">{value}</p></div>
}

function Summary({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 p-4"><div className="mb-3 text-blue-600">{icon}</div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-semibold text-slate-950">{value}</p></div>
}
