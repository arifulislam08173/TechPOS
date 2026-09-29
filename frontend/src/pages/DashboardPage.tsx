import { useQuery } from '@tanstack/react-query'
import { Boxes, FolderTree, History, PackageCheck, ShieldCheck, Users } from 'lucide-react'
import { categoriesApi } from '../api/categories'
import { inventoryApi } from '../api/inventory'
import { productsApi } from '../api/products'
import { usersApi } from '../api/users'
import { useAuth } from '../auth/AuthProvider'
import { Permissions } from '../auth/permissions'
import { Badge } from '../components/ui/Badge'
import { Card, CardHeader } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'

export function DashboardPage() {
  const { hasPermission } = useAuth()
  const canProducts = hasPermission(Permissions.productsView)
  const canCategories = hasPermission(Permissions.categoriesView)
  const canInventory = hasPermission(Permissions.inventoryView)
  const canUsers = hasPermission(Permissions.usersView)

  const products = useQuery({ queryKey: ['dashboard-products'], queryFn: () => productsApi.list({ page: 1, pageSize: 5, isActive: true, sortBy: 'createdAt', sortDirection: 'desc' }), enabled: canProducts })
  const categories = useQuery({ queryKey: ['dashboard-categories'], queryFn: () => categoriesApi.list({ page: 1, pageSize: 1, isActive: true }), enabled: canCategories })
  const history = useQuery({ queryKey: ['dashboard-history'], queryFn: () => inventoryApi.history({ page: 1, pageSize: 5 }), enabled: canInventory })
  const users = useQuery({ queryKey: ['dashboard-users'], queryFn: () => usersApi.list({ page: 1, pageSize: 1, isActive: true }), enabled: canUsers })

  const cards = [
    canProducts ? ['Active products', products.data?.totalItems ?? '—', Boxes] as const : null,
    canCategories ? ['Active categories', categories.data?.totalItems ?? '—', FolderTree] as const : null,
    canInventory ? ['Stock movements', history.data?.totalItems ?? '—', History] as const : null,
    canUsers ? ['Active users', users.data?.totalItems ?? '—', Users] as const : ['API status', 'Connected', PackageCheck] as const,
  ].filter(Boolean) as Array<readonly [string, string | number, typeof Boxes]>

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Operational overview of your computer retail workspace." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon]) => <Card key={label} className="p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p></div><div className="rounded-xl bg-slate-100 p-2.5 text-slate-600"><Icon size={20} /></div></div></Card>)}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        {canProducts && <Card className="xl:col-span-3"><CardHeader title="Recent products" subtitle="Latest active catalog records" /><div className="divide-y divide-slate-100">{products.data?.items.length ? products.data.items.map((product) => <div key={product.id} className="flex items-center justify-between px-5 py-3"><div><p className="text-sm font-medium text-slate-900">{product.name}</p><p className="text-xs text-slate-500">{product.sku} · {product.categoryName}</p></div><Badge tone={product.isLowStock ? 'amber' : 'green'}>{product.stockQuantity} in stock</Badge></div>) : <div className="px-5 py-8 text-center text-sm text-slate-400">No active products yet.</div>}</div></Card>}
        {canInventory ? <Card className={canProducts ? 'xl:col-span-2' : 'xl:col-span-5'}><CardHeader title="Recent stock activity" subtitle="Latest inventory movements" /><div className="divide-y divide-slate-100">{history.data?.items.length ? history.data.items.map((item) => <div key={item.id} className="px-5 py-3"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-medium text-slate-900">{item.productName}</p><Badge tone={item.type.includes('Increase') || item.type === 'StockIn' ? 'green' : 'slate'}>{item.type}</Badge></div><p className="mt-1 text-xs text-slate-500">{item.stockBefore} → {item.stockAfter} · {item.sku}</p></div>) : <div className="px-5 py-8 text-center text-sm text-slate-400">No inventory activity yet.</div>}</div></Card> : <Card className="xl:col-span-2 p-5"><div className="flex gap-3"><ShieldCheck className="text-blue-600" /><div><p className="text-sm font-semibold text-slate-900">Permission-based workspace</p><p className="mt-1 text-xs leading-5 text-slate-500">Navigation and actions adapt to the permissions assigned to your role.</p></div></div></Card>}
      </div>
    </>
  )
}
