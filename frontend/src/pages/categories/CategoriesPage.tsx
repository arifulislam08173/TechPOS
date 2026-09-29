import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit3, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { categoriesApi } from '../../api/categories'
import { getApiError } from '../../api/client'
import { useAuth } from '../../auth/AuthProvider'
import { Permissions } from '../../auth/permissions'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'

export function CategoriesPage() {
  const { hasPermission } = useAuth()
  const canManage = hasPermission(Permissions.categoriesManage)
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const query = { page, pageSize: 10, search: debouncedSearch || undefined, isActive: status === '' ? undefined : status === 'true' }
  const categories = useQuery({ queryKey: ['categories', query], queryFn: () => categoriesApi.list(query), placeholderData: keepPreviousData })
  const remove = useMutation({
    mutationFn: categoriesApi.remove,
    onSuccess: () => { toast.success('Category removed'); queryClient.invalidateQueries({ queryKey: ['categories'] }); queryClient.invalidateQueries({ queryKey: ['category-lookup'] }) },
    onError: (error) => toast.error(getApiError(error)),
  })

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Maintain product groupings used across catalog, inventory and reporting."
        actions={canManage ? <Link to="/categories/new"><Button><Plus size={16} />New category</Button></Link> : undefined}
      />
      <Card>
        <div className="flex flex-wrap gap-3 border-b border-slate-200 p-4">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search categories…" className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </div>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm">
            <option value="">All status</option><option value="true">Active</option><option value="false">Inactive</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          {categories.data?.items.length ? (
            <table className="min-w-full text-left">
              <thead><tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><th className="px-5 py-3">Category</th><th className="px-5 py-3">Created</th><th className="px-5 py-3">Status</th>{canManage && <th className="px-5 py-3 text-right">Actions</th>}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {categories.data.items.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3"><p className="text-sm font-medium text-slate-900">{category.name}</p><p className="text-xs text-slate-500">Catalog grouping #{category.id}</p></td>
                    <td className="px-5 py-3 text-sm text-slate-600">{new Date(category.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3"><Badge tone={category.isActive ? 'green' : 'slate'}>{category.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    {canManage && <td className="px-5 py-3"><div className="flex justify-end gap-2"><Link to={`/categories/${category.id}/edit`} className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"><Edit3 size={15} /></Link><button onClick={() => confirm(`Delete ${category.name}?`) && remove.mutate(category.id)} className="grid size-9 place-items-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button></div></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <EmptyState title="No categories found" description="Create a category or adjust the current filters." />}
        </div>
        {categories.data && <Pagination page={page} totalPages={categories.data.totalPages} totalItems={categories.data.totalItems} onPageChange={setPage} />}
      </Card>
    </>
  )
}
