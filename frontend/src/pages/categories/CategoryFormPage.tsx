import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { categoriesApi } from '../../api/categories'
import { getApiError } from '../../api/client'
import { useAuth } from '../../auth/AuthProvider'
import { Permissions } from '../../auth/permissions'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { FormField, inputClass } from '../../components/ui/FormField'
import { PageHeader } from '../../components/ui/PageHeader'

type Form = { name: string; isActive: boolean }

export function CategoryFormPage() {
  const { hasPermission } = useAuth()
  const { id } = useParams()
  const categoryId = id ? Number(id) : null
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const existing = useQuery({ queryKey: ['category', categoryId], queryFn: () => categoriesApi.get(categoryId!), enabled: !!categoryId })
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ defaultValues: { isActive: true } })

  useEffect(() => { if (existing.data) reset({ name: existing.data.name, isActive: existing.data.isActive }) }, [existing.data, reset])

  const save = useMutation({
    mutationFn: (data: Form) => categoryId ? categoriesApi.update(categoryId, data) : categoriesApi.create({ name: data.name }),
    onSuccess: () => {
      toast.success(categoryId ? 'Category updated' : 'Category created')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['category-lookup'] })
      navigate('/categories')
    },
    onError: (error) => toast.error(getApiError(error)),
  })

  if (!hasPermission(Permissions.categoriesManage)) return <Navigate to="/categories" replace />
  const submit = handleSubmit((data) => save.mutate(data))

  return (
    <>
      <PageHeader title={categoryId ? 'Edit category' : 'New category'} subtitle="Create a clear catalog structure for product discovery and reporting." actions={<><Link to="/categories"><Button variant="secondary">Discard</Button></Link><Button onClick={submit} disabled={save.isPending}><Save size={16} />{save.isPending ? 'Saving…' : 'Save category'}</Button></>} />
      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-8"><CardHeader title="Category information" subtitle="Naming and catalog grouping" /><div className="p-5"><FormField label="Category name" hint="Use a concise name such as Laptop, RAM, Monitor or Keyboard." error={errors.name ? 'Category name is required.' : undefined}><input className={inputClass} {...register('name', { required: true, minLength: 2, maxLength: 100 })} /></FormField></div></Card>
        <Card className="h-fit xl:col-span-4"><CardHeader title="Record status" subtitle="Control category availability" /><div className="space-y-4 p-5">{categoryId ? <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4"><span><span className="block text-sm font-medium text-slate-900">Active category</span><span className="text-xs text-slate-500">Available when maintaining products</span></span><input type="checkbox" className="size-4" {...register('isActive')} /></label> : <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">New categories are active by default.</div>}</div></Card>
      </form>
    </>
  )
}
