import { useQuery } from '@tanstack/react-query'
import { Edit3, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { rolesApi } from '../../api/roles'
import { useAuth } from '../../auth/AuthProvider'
import { Permissions } from '../../auth/permissions'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'

export function RolesPage() {
  const { hasPermission } = useAuth()
  const canManage = hasPermission(Permissions.rolesManage)
  const roles = useQuery({ queryKey: ['roles'], queryFn: rolesApi.list })

  return (
    <>
      <PageHeader title="Roles & permissions" subtitle="Define reusable access profiles and assign granular permissions to staff roles." actions={canManage ? <Link to="/roles/new"><Button><Plus size={16} />New role</Button></Link> : undefined} />
      <Card>
        <div className="overflow-x-auto">
          {roles.data?.length ? <table className="min-w-full text-left"><thead><tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><th className="px-5 py-3">Role</th><th className="px-5 py-3">Users</th><th className="px-5 py-3">Permissions</th><th className="px-5 py-3">Status</th>{canManage && <th className="px-5 py-3 text-right">Actions</th>}</tr></thead><tbody className="divide-y divide-slate-100">{roles.data.map((role) => <tr key={role.id} className="hover:bg-slate-50/70"><td className="px-5 py-3"><div className="flex items-center gap-2"><p className="text-sm font-medium text-slate-900">{role.name}</p>{role.isSystem && <Badge tone="blue">System</Badge>}</div><p className="mt-0.5 max-w-xl text-xs text-slate-500">{role.description || 'No description'}</p></td><td className="px-5 py-3 text-sm text-slate-600">{role.userCount}</td><td className="px-5 py-3 text-sm text-slate-600">{role.permissionCodes.length}</td><td className="px-5 py-3"><Badge tone={role.isActive ? 'green' : 'slate'}>{role.isActive ? 'Active' : 'Inactive'}</Badge></td>{canManage && <td className="px-5 py-3"><div className="flex justify-end">{role.isSystem ? <span className="text-xs text-slate-400">Protected</span> : <Link to={`/roles/${role.id}/edit`} className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"><Edit3 size={15} /></Link>}</div></td>}</tr>)}</tbody></table> : <EmptyState title="No roles found" description="Create a role to define permission-based access." />}
        </div>
      </Card>
    </>
  )
}
