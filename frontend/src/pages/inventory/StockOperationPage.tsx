import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardCheck, Save } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getApiError } from '../../api/client'
import { inventoryApi } from '../../api/inventory'
import { productsApi } from '../../api/products'
import { useAuth } from '../../auth/AuthProvider'
import { Permissions } from '../../auth/permissions'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { FormField, inputClass } from '../../components/ui/FormField'
import { PageHeader } from '../../components/ui/PageHeader'

type Mode = 'stock-in' | 'stock-out' | 'adjust'
type Form = { productId: number; quantity: number; note: string }

export function StockOperationPage() {
  const { hasPermission } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<Mode>('stock-in')
  const products = useQuery({ queryKey: ['product-operation-lookup'], queryFn: () => productsApi.list({ page: 1, pageSize: 100, isActive: true, sortBy: 'name', sortDirection: 'asc' }) })
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ defaultValues: { quantity: 1, note: '' } })

  const operation = useMutation({
    mutationFn: async (data: Form) => {
      if (mode === 'stock-in') return inventoryApi.stockIn({ productId: Number(data.productId), quantity: Number(data.quantity), note: data.note || undefined })
      if (mode === 'stock-out') return inventoryApi.stockOut({ productId: Number(data.productId), quantity: Number(data.quantity), reason: data.note })
      return inventoryApi.adjust({ productId: Number(data.productId), newQuantity: Number(data.quantity), reason: data.note })
    },
    onSuccess: () => {
      toast.success('Stock operation completed')
      queryClient.invalidateQueries({ queryKey: ['inventory-history'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      reset({ quantity: 1, note: '' })
      navigate('/inventory')
    },
    onError: (error) => toast.error(getApiError(error)),
  })

  if (!hasPermission(Permissions.inventoryManage)) return <Navigate to="/inventory" replace />
  const submit = handleSubmit((data) => operation.mutate(data))

  return (
    <>
      <PageHeader title="New stock operation" subtitle="Record controlled stock changes while preserving a complete inventory audit trail." actions={<><Link to="/inventory"><Button variant="secondary">Discard</Button></Link><Button onClick={submit} disabled={operation.isPending}><Save size={16} />{operation.isPending ? 'Applying…' : 'Apply operation'}</Button></>} />
      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-8"><CardHeader title="Operation details" subtitle="Choose the movement and product balance change" /><div className="space-y-5 p-5"><div className="grid gap-3 sm:grid-cols-3">{(['stock-in', 'stock-out', 'adjust'] as Mode[]).map((value) => <button key={value} type="button" onClick={() => setMode(value)} className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${mode === value ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{value === 'stock-in' ? 'Stock in' : value === 'stock-out' ? 'Stock out' : 'Adjustment'}</button>)}</div><div className="grid gap-5 md:grid-cols-2"><FormField label="Product" error={errors.productId ? 'Select a product.' : undefined}><select className={inputClass} {...register('productId', { required: true, valueAsNumber: true })}><option value="">Select product</option>{products.data?.items.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.sku} · Stock {product.stockQuantity}</option>)}</select></FormField><FormField label={mode === 'adjust' ? 'New stock quantity' : 'Quantity'} hint={mode === 'adjust' ? 'Enter the actual physical balance after stock verification.' : 'Enter the quantity for this stock movement.'}><input type="number" min={mode === 'adjust' ? 0 : 1} className={inputClass} {...register('quantity', { required: true, valueAsNumber: true, min: mode === 'adjust' ? 0 : 1 })} /></FormField></div><FormField label={mode === 'stock-in' ? 'Note (optional)' : 'Reason'} error={errors.note ? 'A reason is required for stock reduction or adjustment.' : undefined}><textarea rows={5} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" {...register('note', { required: mode !== 'stock-in' })} placeholder={mode === 'stock-in' ? 'Opening stock, supplier delivery, purchase receipt…' : 'Explain why this balance is changing…'} /></FormField></div></Card>
        <Card className="h-fit xl:col-span-4"><CardHeader title="Audit protection" subtitle="Why stock history is immutable" /><div className="p-5"><div className="rounded-2xl bg-slate-50 p-4"><ClipboardCheck className="mb-3 text-blue-600" size={22} /><p className="text-sm font-medium text-slate-900">Every movement is traceable</p><p className="mt-2 text-xs leading-5 text-slate-500">Stock transactions are not edited after creation. Corrections should be recorded as a new adjustment so the original movement remains visible for audit and reporting.</p></div></div></Card>
      </form>
    </>
  )
}
