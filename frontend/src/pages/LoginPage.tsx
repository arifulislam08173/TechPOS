import { Mail, PackageOpen } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getApiError } from '../api/client'
import { useAuth } from '../auth/AuthProvider'
import { Button } from '../components/ui/Button'
import { PasswordInput } from '../components/ui/PasswordInput'

type Form = { email: string; password: string }

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<Form>()

  if (user) return <Navigate to="/" replace />

  const submit = handleSubmit(async (values) => {
    try {
      setBusy(true)
      await login(values.email, values.password)
      toast.success('Signed in successfully')
      navigate('/')
    } catch (error) {
      toast.error(getApiError(error, 'Invalid email or password.'))
    } finally {
      setBusy(false)
    }
  })

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-5">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-7 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-blue-600 text-white">
            <PackageOpen size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-950">Welcome to TechPOS</h1>
            <p className="text-sm text-slate-500">Secure retail operations workspace</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={17} />
              <input
                type="email"
                autoComplete="email"
                className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                {...register('email', { required: true })}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-600">Email is required.</p>}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Password</span>
            <PasswordInput autoComplete="current-password" {...register('password', { required: true, minLength: 8 })} />
            {errors.password && <p className="mt-1 text-xs text-red-600">Minimum 8 characters.</p>}
          </label>

          <Button className="mt-2 w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-400">
          JWT-protected API · Permission-based access control
        </p>
      </div>
    </div>
  )
}
