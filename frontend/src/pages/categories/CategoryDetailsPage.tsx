import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Edit3, FolderTree, Package } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { categoriesApi } from '../../api/categories'
import { productsApi } from '../../api/products'
import { useAuth } from '../../auth/AuthProvider'
import { Permissions } from '../../auth/permissions'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { formatDateTime } from '../../utils/format'

export function CategoryDetailsPage() {
  const { id } = useParams()
  const categoryId = Number(id)
  const { hasPermission } = useAuth()
  const canManage = hasPermission(Permissions.categoriesManage)

  const category = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => categoriesApi.get(categoryId),
    enabled: Number.isFinite(categoryId),
  })

  const productCount = useQuery({
    queryKey: ['category-product-count', categoryId],
    queryFn: () => productsApi.list({ page: 1, pageSize: 1, categoryId }),
    enabled: Number.isFinite(categoryId),
  })

  if (!Number.isFinite(categoryId)) return <Navigate to="/categories" replace />

  return (
    <>
      <PageHeader
        title="Category details"
        subtitle="Read-only category information and catalog usage."
        actions={
          <>
            <Link to="/categories"><Button variant="secondary"><ArrowLeft size={16} />Back</Button></Link>
            {canManage && <Link to={`/categories/${categoryId}/edit`}><Button><Edit3 size={16} />Edit category</Button></Link>}
          </>
        }
      />

      {category.isLoading ? (
        <Card className="p-8 text-sm text-slate-500">Loading category details…</Card>
      ) : category.data ? (
        <div className="grid gap-6 xl:grid-cols-12">
          <Card className="xl:col-span-8">
            <CardHeader title="Category information" subtitle="Catalog classification record" />
            <div className="grid gap-6 p-5 md:grid-cols-2">
              <Detail label="Category ID" value={`#${category.data.id}`} />
              <Detail label="Category name" value={category.data.name} />
              <Detail label="Created" value={formatDateTime(category.data.createdAt)} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Status</p>
                <div className="mt-2"><Badge tone={category.data.isActive ? 'green' : 'slate'}>{category.data.isActive ? 'Active' : 'Inactive'}</Badge></div>
              </div>
            </div>
          </Card>

          <Card className="xl:col-span-4">
            <CardHeader title="Catalog usage" subtitle="Current relationship summary" />
            <div className="grid gap-4 p-5">
              <Summary icon={<FolderTree size={18} />} label="Category" value={category.data.name} />
              <Summary icon={<Package size={18} />} label="Products assigned" value={String(productCount.data?.totalItems ?? '—')} />
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-8 text-sm text-red-600">Category could not be loaded.</Card>
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
