import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'
import { productsApi } from '../../api/products'
import { categoriesApi } from '../../api/categories'
import { getApiError } from '../../api/client'
import { useAuth } from '../../auth/AuthProvider'
import { Permissions } from '../../auth/permissions'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { FormField, inputClass } from '../../components/ui/FormField'
import type { ProductInput } from '../../types/product'

type Form = ProductInput & { isActive: boolean }

export function ProductFormPage() {
  const { hasPermission } = useAuth()
  const { id } = useParams()
  const productId = id ? Number(id) : null
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const categories = useQuery({ queryKey: ['category-lookup'], queryFn: categoriesApi.lookup })
  const existing = useQuery({ queryKey: ['product', productId], queryFn: () => productsApi.get(productId!), enabled: !!productId })
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ defaultValues: { lowStockThreshold: 5, isActive: true } })

  useEffect(() => {
    if (existing.data) reset({ ...existing.data, brand: existing.data.brand ?? '' })
  }, [existing.data, reset])

  const save = useMutation({
    mutationFn: (data: Form) => productId ? productsApi.update(productId, data) : productsApi.create(data),
    onSuccess: () => {
      toast.success(productId ? 'Product updated' : 'Product created')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      navigate('/products')
    },
    onError: (error) => toast.error(getApiError(error)),
  })

  if (!hasPermission(Permissions.productsManage)) return <Navigate to="/products" replace />

  const submit = handleSubmit((data) => save.mutate({
    ...data,
    purchasePrice: Number(data.purchasePrice),
    sellingPrice: Number(data.sellingPrice),
    lowStockThreshold: Number(data.lowStockThreshold),
    categoryId: Number(data.categoryId),
  }))

  return (
    <>
      <PageHeader
        title={productId ? 'Edit product' : 'New product'}
        subtitle="Maintain catalog data while keeping stock changes inside the audited inventory workflow."
        actions={<><Link to="/products"><Button variant="secondary">Discard</Button></Link><Button onClick={submit} disabled={save.isPending}><Save size={16} />{save.isPending ? 'Saving…' : 'Save product'}</Button></>}
      />
      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader title="Product information" subtitle="Core catalog and pricing details" />
          <div className="grid gap-5 p-5 md:grid-cols-2">
            <FormField label="Product name" error={errors.name ? 'Product name is required.' : undefined}><input className={inputClass} {...register('name', { required: true, minLength: 2 })} /></FormField>
            <FormField label="SKU" error={errors.sku ? 'SKU is required.' : undefined}><input className={inputClass} {...register('sku', { required: true })} /></FormField>
            <FormField label="Brand"><input className={inputClass} {...register('brand')} /></FormField>
            <FormField label="Category" error={errors.categoryId ? 'Category is required.' : undefined}><select className={inputClass} {...register('categoryId', { required: true, valueAsNumber: true })}><option value="">Select category</option>{categories.data?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></FormField>
            <FormField label="Purchase price"><input type="number" step="0.01" className={inputClass} {...register('purchasePrice', { required: true, valueAsNumber: true, min: 0 })} /></FormField>
            <FormField label="Selling price"><input type="number" step="0.01" className={inputClass} {...register('sellingPrice', { required: true, valueAsNumber: true, min: 0 })} /></FormField>
          </div>
        </Card>
        <Card className="h-fit xl:col-span-4">
          <CardHeader title="Record setup" subtitle="Availability and inventory controls" />
          <div className="space-y-5 p-5">
            <FormField label="Low-stock threshold" hint="Products at or below this quantity are flagged as low stock."><input type="number" className={inputClass} {...register('lowStockThreshold', { valueAsNumber: true, min: 0 })} /></FormField>
            {productId && <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4"><span><span className="block text-sm font-medium text-slate-900">Active product</span><span className="text-xs text-slate-500">Available for retail operations</span></span><input type="checkbox" className="size-4" {...register('isActive')} /></label>}
            <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">Stock quantity is intentionally read-only here. Use Inventory → New stock operation so every quantity change has an audit trail.</p>
          </div>
        </Card>
      </form>
    </>
  )
}
