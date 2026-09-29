import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Save, ShieldCheck } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getApiError } from '../../api/client'
import { rolesApi } from '../../api/roles'
import { useAuth } from '../../auth/AuthProvider'
import { Permissions } from '../../auth/permissions'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { FormField, inputClass } from '../../components/ui/FormField'
import { PageHeader } from '../../components/ui/PageHeader'

type Form = { name: string; description: string; isActive: boolean; permissionCodes: string[] }

export function RoleFormPage() {
  const { hasPermission } = useAuth()
  const { id } = useParams()
  const roleId = id ? Number(id) : null
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const existing = useQuery({ queryKey: ['role', roleId], queryFn: () => rolesApi.get(roleId!), enabled: !!roleId })
  const permissions = useQuery({ queryKey: ['permissions'], queryFn: rolesApi.permissions })
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<Form>({ defaultValues: { description: '', isActive: true, permissionCodes: [] } })
  const selected = watch('permissionCodes') || []

  useEffect(() => {
    if (existing.data) reset({ name: existing.data.name, description: existing.data.description ?? '', isActive: existing.data.isActive, permissionCodes: existing.data.permissionCodes })
  }, [existing.data, reset])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof permissions.data>()
    for (const permission of permissions.data ?? []) {
      const list = map.get(permission.module) ?? []
      list.push(permission)
      map.set(permission.module, list)
    }
    return [...map.entries()]
  }, [permissions.data])

  const save = useMutation({
    mutationFn: (data: Form) => roleId
      ? rolesApi.update(roleId, { description: data.description || undefined, isActive: data.isActive, permissionCodes: data.permissionCodes })
      : rolesApi.create({ name: data.name, description: data.description || undefined, permissionCodes: data.permissionCodes }),
    onSuccess: () => { toast.success(roleId ? 'Role updated' : 'Role created'); queryClient.invalidateQueries({ queryKey: ['roles'] }); navigate('/roles') },
    onError: (error) => toast.error(getApiError(error)),
  })

  if (!hasPermission(Permissions.rolesManage)) return <Navigate to="/roles" replace />
  if (existing.data?.isSystem) return <Navigate to="/roles" replace />
  const submit = handleSubmit((data) => save.mutate(data))

  const toggleModule = (codes: string[]) => {
    const allSelected = codes.every((code) => selected.includes(code))
    setValue('permissionCodes', allSelected ? selected.filter((code) => !codes.includes(code)) : [...new Set([...selected, ...codes])], { shouldDirty: true })
  }

  return (
    <>
      <PageHeader title={roleId ? 'Edit role' : 'New role'} subtitle="Build a reusable permission profile and assign it to one or more users." actions={<><Link to="/roles"><Button variant="secondary">Discard</Button></Link><Button onClick={submit} disabled={save.isPending}><Save size={16} />{save.isPending ? 'Saving…' : 'Save role'}</Button></>} />
      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-4"><CardHeader title="Role information" subtitle="Name, purpose and lifecycle" /><div className="space-y-5 p-5"><FormField label="Role name" hint={roleId ? 'Role names are immutable after creation.' : 'Examples: Inventory Manager, Sales Supervisor.'} error={errors.name ? 'Role name is required.' : undefined}><input className={inputClass} disabled={!!roleId} {...register('name', { required: true, minLength: 2 })} /></FormField><FormField label="Description"><textarea rows={5} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" {...register('description')} /></FormField>{roleId && <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4"><span><span className="block text-sm font-medium text-slate-900">Active role</span><span className="text-xs text-slate-500">Available for user assignment</span></span><input type="checkbox" className="size-4" {...register('isActive')} /></label>}</div></Card>
        <Card className="xl:col-span-8"><CardHeader title="Permissions" subtitle={`${selected.length} permission${selected.length === 1 ? '' : 's'} selected`} /><div className="space-y-5 p-5">{grouped.map(([module, list]) => { const codes = (list ?? []).map((permission) => permission.code); return <section key={module} className="rounded-2xl border border-slate-200"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div className="flex items-center gap-2"><ShieldCheck size={17} className="text-blue-600" /><p className="text-sm font-semibold text-slate-900">{module}</p></div><button type="button" onClick={() => toggleModule(codes)} className="text-xs font-medium text-blue-600 hover:text-blue-700">{codes.every((code) => selected.includes(code)) ? 'Clear module' : 'Select module'}</button></div><div className="grid gap-2 p-3 md:grid-cols-2">{list?.map((permission) => <label key={permission.code} className="flex cursor-pointer gap-3 rounded-xl p-3 hover:bg-slate-50"><input type="checkbox" value={permission.code} className="mt-1 size-4" {...register('permissionCodes')} /><span><span className="block text-sm font-medium text-slate-800">{permission.name}</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">{permission.description}</span></span></label>)}</div></section> })}</div></Card>
      </form>
    </>
  )
}
