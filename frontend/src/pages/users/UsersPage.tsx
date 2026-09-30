import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Edit3, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { rolesApi } from '../../api/roles'
import { usersApi } from '../../api/users'
import { useAuth } from '../../auth/AuthProvider'
import { Permissions } from '../../auth/permissions'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { RemoteSearchSelect } from '../../components/ui/RemoteSearchSelect'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'

export function UsersPage() {
  const { hasPermission } = useAuth()
  const canManage = hasPermission(Permissions.usersManage)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<string | undefined>()
  const [status, setStatus] = useState('')
  const debouncedSearch = useDebouncedValue(search)

  const query = {
    page,
    pageSize: 10,
    search: debouncedSearch || undefined,
    role,
    isActive: status === '' ? undefined : status === 'true',
  }

  const users = useQuery({
    queryKey: ['users', query],
    queryFn: () => usersApi.list(query),
    placeholderData: keepPreviousData,
  })

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Manage staff access, assigned roles and account status."
        actions={canManage ? <Link to="/users/new"><Button><Plus size={16} />New user</Button></Link> : undefined}
      />

      <Card>
        <div className="flex flex-wrap gap-3 border-b border-slate-200 p-4">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1) }}
              placeholder="Search name or email…"
              className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="w-full sm:w-56">
            <RemoteSearchSelect
              queryKey={['user-list-role-filter']}
              value={role}
              onChange={(value) => { setRole(value as string | undefined); setPage(1) }}
              loadPage={rolesApi.lookup}
              getOptionValue={(item) => item.name}
              getOptionLabel={(item) => item.name}
              placeholder="All roles"
              searchPlaceholder="Search roles…"
              allowClear
            />
          </div>

          <select
            value={status}
            onChange={(event) => { setStatus(event.target.value); setPage(1) }}
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">All status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {users.data?.items.length ? (
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">User</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Created</th>{canManage && <th className="px-5 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.data.items.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3"><p className="text-sm font-medium text-slate-900">{user.fullName}</p><p className="text-xs text-slate-500">{user.email}</p></td>
                    <td className="px-5 py-3"><Badge tone="blue">{user.role}</Badge></td>
                    <td className="px-5 py-3"><Badge tone={user.isActive ? 'green' : 'slate'}>{user.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-5 py-3 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    {canManage && <td className="px-5 py-3"><div className="flex justify-end"><Link to={`/users/${user.id}/edit`} className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"><Edit3 size={15} /></Link></div></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <EmptyState title="No users found" description="Create a user or adjust the current filters." />}
        </div>

        {users.data && <Pagination page={page} totalPages={users.data.totalPages} totalItems={users.data.totalItems} onPageChange={setPage} />}
      </Card>
    </>
  )
}
