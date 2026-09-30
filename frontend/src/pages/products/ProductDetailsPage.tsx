import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Edit3, Package, Tags, WalletCards } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { productsApi } from '../../api/products'
import { useAuth } from '../../auth/AuthProvider'
import { Permissions } from '../../auth/permissions'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { formatCurrency, formatDateTime } from '../../utils/format'

export function ProductDetailsPage() {
  const { id } = useParams()
  const productId = Number(id)
  const { hasPermission } = useAuth()
  const canManage = hasPermission(Permissions.productsManage)

  const product = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.get(productId),
    enabled: Number.isFinite(productId),
  })

  if (!Number.isFinite(productId)) return <Navigate to="/products" replace />

  return (
    <>
      <PageHeader
        title="Product details"
        subtitle="Read-only catalog, pricing and stock information."
        actions={
          <>
            <Link to="/products"><Button variant="secondary"><ArrowLeft size={16} />Back</Button></Link>
            {canManage && <Link to={`/products/${productId}/edit`}><Button><Edit3 size={16} />Edit product</Button></Link>}
          </>
        }
      />

      {product.isLoading ? (
        <Card className="p-8 text-sm text-slate-500">Loading product details…</Card>
      ) : product.data ? (
        <div className="grid gap-6 xl:grid-cols-12">
          <Card className="xl:col-span-7">
            <CardHeader title="Catalog information" subtitle="Identity and classification" />
            <div className="grid gap-5 p-5 md:grid-cols-2">
              <Detail label="Product name" value={product.data.name} />
              <Detail label="SKU" value={product.data.sku} />
              <Detail label="Brand" value={product.data.brand || '—'} />
              <Detail label="Category" value={product.data.categoryName} icon={<Tags size={15} />} />
              <Detail label="Created" value={formatDateTime(product.data.createdAt)} />
              <Detail label="Last updated" value={formatDateTime(product.data.updatedAt)} />
            </div>
          </Card>

          <Card className="xl:col-span-5">
            <CardHeader title="Commercial status" subtitle="Pricing and inventory balance" />
            <div className="space-y-5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Metric icon={<WalletCards size={18} />} label="Purchase price" value={formatCurrency(product.data.purchasePrice)} />
                <Metric icon={<WalletCards size={18} />} label="Selling price" value={formatCurrency(product.data.sellingPrice)} />
                <Metric icon={<Package size={18} />} label="Current stock" value={String(product.data.stockQuantity)} />
                <Metric icon={<Package size={18} />} label="Low-stock threshold" value={String(product.data.lowStockThreshold)} />
              </div>
              <div className="flex flex-wrap gap-2 rounded-xl bg-slate-50 p-4">
                <Badge tone={product.data.isActive ? 'green' : 'slate'}>{product.data.isActive ? 'Active' : 'Inactive'}</Badge>
                <Badge tone={product.data.isLowStock ? 'amber' : 'green'}>{product.data.isLowStock ? 'Low stock' : 'Healthy stock'}</Badge>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-8 text-sm text-red-600">Product could not be loaded.</Card>
      )}
    </>
  )
}

function Detail({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1.5 flex items-center gap-2 text-sm font-medium text-slate-900">{icon}{value}</div>
    </div>
  )
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-3 text-blue-600">{icon}</div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  )
}
