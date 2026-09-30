import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreditCard, Minus, Plus, Search, ShoppingCart, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getApiError } from '../../api/client'
import { productsApi } from '../../api/products'
import { salesApi } from '../../api/sales'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import type { Product } from '../../types/product'
import type { PaymentMethod } from '../../types/sale'
import { formatCurrency } from '../../utils/format'

type CartLine = Product & { quantity: number }

export function PosPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 250)
  const [cart, setCart] = useState<CartLine[]>([])
  const [discountAmount, setDiscountAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash')
  const [amountPaid, setAmountPaid] = useState(0)
  const [note, setNote] = useState('')

  const products = useQuery({
    queryKey: ['pos-products', debouncedSearch],
    queryFn: () => productsApi.list({
      page: 1,
      pageSize: 20,
      search: debouncedSearch || undefined,
      isActive: true,
      sortBy: 'name',
      sortDirection: 'asc',
    }),
    placeholderData: keepPreviousData,
  })

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0),
    [cart],
  )
  const safeDiscount = Math.min(Math.max(discountAmount || 0, 0), subtotal)
  const grandTotal = Math.max(subtotal - safeDiscount, 0)
  const changeAmount = paymentMethod === 'Cash' ? Math.max((amountPaid || 0) - grandTotal, 0) : 0

  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) return
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (!existing) return [...current, { ...product, quantity: 1 }]
      if (existing.quantity >= product.stockQuantity) {
        toast.error(`Only ${product.stockQuantity} unit(s) available.`)
        return current
      }
      return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
    })
  }

  const changeQuantity = (productId: number, nextQuantity: number) => {
    setCart((current) => current
      .map((item) => item.id === productId
        ? { ...item, quantity: Math.min(Math.max(nextQuantity, 1), item.stockQuantity) }
        : item)
      .filter((item) => item.quantity > 0))
  }

  const checkout = useMutation({
    mutationFn: salesApi.create,
    onSuccess: (sale) => {
      toast.success(`Sale ${sale.invoiceNumber} completed`)
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['pos-products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      setCart([])
      setDiscountAmount(0)
      setAmountPaid(0)
      setNote('')
      navigate(`/sales/${sale.id}`)
    },
    onError: (error) => toast.error(getApiError(error, 'Unable to complete the sale.')),
  })

  const submitSale = () => {
    if (!cart.length) return toast.error('Add at least one product to the cart.')
    if (safeDiscount > subtotal) return toast.error('Discount cannot exceed the subtotal.')
    const paid = paymentMethod === 'Cash' ? Number(amountPaid || 0) : grandTotal
    if (paid < grandTotal) return toast.error('Amount paid is lower than the grand total.')

    checkout.mutate({
      items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
      discountAmount: safeDiscount,
      paymentMethod,
      amountPaid: paid,
      note: note.trim() || undefined,
    })
  }

  return (
    <>
      <PageHeader
        title="Point of sale"
        subtitle="Search inventory, build the cart and complete a stock-safe sale."
      />

      <div className="grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader title="Products" subtitle="Search is handled by the backend and limited to active products." />
          <div className="border-b border-slate-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search product name, SKU or brand…"
                className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="max-h-[620px] overflow-y-auto p-4">
            {products.isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-slate-100" />)}
              </div>
            ) : products.data?.items.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {products.data.items.map((product) => {
                  const inCart = cart.find((item) => item.id === product.id)?.quantity ?? 0
                  const unavailable = product.stockQuantity <= 0 || inCart >= product.stockQuantity
                  return (
                    <button
                      key={product.id}
                      type="button"
                      disabled={unavailable}
                      onClick={() => addToCart(product)}
                      className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">{product.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{product.sku}{product.brand ? ` · ${product.brand}` : ''}</p>
                        </div>
                        <Badge tone={product.isLowStock ? 'amber' : 'green'}>{product.stockQuantity} stock</Badge>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-base font-semibold text-slate-900">{formatCurrency(product.sellingPrice)}</p>
                        <span className="text-xs font-medium text-blue-600">{unavailable ? 'Unavailable' : 'Add to cart'}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : <EmptyState title="No matching products" description="Try another name, SKU or brand." />}
          </div>
        </Card>

        <Card className="h-fit xl:col-span-5 xl:sticky xl:top-20">
          <CardHeader title="Current cart" subtitle={`${cart.reduce((sum, item) => sum + item.quantity, 0)} item(s) selected`} />

          <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100">
            {cart.length ? cart.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.sku} · {formatCurrency(item.sellingPrice)}</p>
                  </div>
                  <button type="button" onClick={() => setCart((current) => current.filter((line) => line.id !== item.id))} className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50">
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-xl border border-slate-200">
                    <button type="button" onClick={() => changeQuantity(item.id, item.quantity - 1)} className="grid size-9 place-items-center text-slate-600 hover:bg-slate-50"><Minus size={14} /></button>
                    <input
                      type="number"
                      min={1}
                      max={item.stockQuantity}
                      value={item.quantity}
                      onChange={(event) => changeQuantity(item.id, Number(event.target.value) || 1)}
                      className="h-9 w-12 border-x border-slate-200 text-center text-sm outline-none"
                    />
                    <button type="button" onClick={() => changeQuantity(item.id, item.quantity + 1)} className="grid size-9 place-items-center text-slate-600 hover:bg-slate-50"><Plus size={14} /></button>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.sellingPrice * item.quantity)}</p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center">
                <ShoppingCart className="mx-auto text-slate-300" size={30} />
                <p className="mt-3 text-sm font-medium text-slate-700">Cart is empty</p>
                <p className="mt-1 text-xs text-slate-400">Select products from the catalog to begin a sale.</p>
              </div>
            )}
          </div>

          <div className="space-y-4 border-t border-slate-200 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Discount</span>
                <input type="number" min={0} max={subtotal} step="0.01" value={discountAmount} onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)} className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-blue-500" />
              </label>
              <label>
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Payment</span>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm">
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="MobileBanking">Mobile banking</option>
                </select>
              </label>
            </div>

            {paymentMethod === 'Cash' && (
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Amount paid</span>
                <input type="number" min={0} step="0.01" value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value) || 0)} className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-blue-500" />
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Note</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={500} placeholder="Optional sale note" className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-blue-500" />
            </label>

            <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Discount</span><span>- {formatCurrency(safeDiscount)}</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-950"><span>Grand total</span><span>{formatCurrency(grandTotal)}</span></div>
              {paymentMethod === 'Cash' && <div className="flex justify-between text-emerald-700"><span>Change</span><span>{formatCurrency(changeAmount)}</span></div>}
            </div>

            <Button type="button" onClick={submitSale} disabled={!cart.length || checkout.isPending} className="w-full">
              <CreditCard size={17} />
              {checkout.isPending ? 'Completing sale…' : 'Complete sale'}
            </Button>
          </div>
        </Card>
      </div>
    </>
  )
}
