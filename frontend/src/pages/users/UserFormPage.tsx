import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound, Save } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getApiError } from '../../api/client'
import { rolesApi } from '../../api/roles'
import { usersApi } from '../../api/users'
import { useAuth } from '../../auth/AuthProvider'
import { Permissions } from '../../auth/permissions'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { FormField, inputClass } from '../../components/ui/FormField'
import { PageHeader } from '../../components/ui/PageHeader'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { RemoteSearchSelect } from '../../components/ui/RemoteSearchSelect'

type Form = { fullName: string; email: string; role: string; password: string; isActive: boolean }
type ResetForm = { newPassword: string; confirmPassword: string }

export function UserFormPage() {
  const { hasPermission } = useAuth()
  const { id } = useParams()
  const userId = id ? Number(id) : null
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const existing = useQuery({ queryKey: ['user', userId], queryFn: () => usersApi.get(userId!), enabled: !!userId })
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Form>({ defaultValues: { isActive: true, password: '' } })
  const resetPasswordForm = useForm<ResetForm>()
  const [showReset, setShowReset] = useState(false)
  const role = watch('role')

  useEffect(() => {
    if (existing.data) {
      reset({
        fullName: existing.data.fullName,
        email: existing.data.email,
        role: existing.data.role,
        password: '',
        isActive: existing.data.isActive,
      })
    }
  }, [existing.data, reset])

  const save = useMutation({
    mutationFn: (data: Form) => userId
      ? usersApi.update(userId, { fullName: data.fullName, email: data.email, role: data.role, isActive: data.isActive })
      : usersApi.create({ fullName: data.fullName, email: data.email, role: data.role, password: data.password }),
    onSuccess: () => {
      toast.success(userId ? 'User updated' : 'User created')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      navigate('/users')
    },
    onError: (error) => toast.error(getApiError(error)),
  })

  const resetPassword = useMutation({
    mutationFn: (data: ResetForm) => usersApi.resetPassword(userId!, data),
    onSuccess: () => {
      toast.success('Password reset successfully')
      resetPasswordForm.reset()
      setShowReset(false)
    },
    onError: (error) => toast.error(getApiError(error)),
  })

  if (!hasPermission(Permissions.usersManage)) return <Navigate to="/users" replace />
  const submit = handleSubmit((data) => save.mutate(data))

  return (
    <>
      <PageHeader
        title={userId ? 'Edit user' : 'New user'}
        subtitle="Control staff identity, role assignment and account availability."
        actions={
          <>
            <Link to="/users"><Button variant="secondary">Discard</Button></Link>
            <Button onClick={submit} disabled={save.isPending}>
              <Save size={16} />{save.isPending ? 'Saving…' : 'Save user'}
            </Button>
          </>
        }
      />

      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader title="User information" subtitle="Identity and sign-in details" />
          <div className="grid gap-5 p-5 md:grid-cols-2">
            <FormField label="Full name" error={errors.fullName ? 'Full name is required.' : undefined}>
              <input className={inputClass} {...register('fullName', { required: true, minLength: 2 })} />
            </FormField>

            <FormField label="Email" error={errors.email ? 'Enter a valid email address.' : undefined}>
              <input type="email" className={inputClass} {...register('email', { required: true })} />
            </FormField>

            <FormField label="Role" hint="Search active roles">
              <input type="hidden" {...register('role', { required: true })} />
              <RemoteSearchSelect
                queryKey={['user-role-lookup']}
                value={role || undefined}
                selectedLabel={existing.data?.role}
                onChange={(value) => setValue('role', String(value || ''), { shouldValidate: true, shouldDirty: true })}
                loadPage={rolesApi.lookup}
                getOptionValue={(option) => option.name}
                getOptionLabel={(option) => option.name}
                placeholder="Select role"
                searchPlaceholder="Search roles…"
              />
            </FormField>

            {!userId && (
              <FormField
                label="Temporary password"
                hint="Minimum 8 characters with uppercase, lowercase and a number."
                error={errors.password ? 'A valid temporary password is required.' : undefined}
              >
                <PasswordInput {...register('password', { required: true, minLength: 8 })} />
              </FormField>
            )}
          </div>
        </Card>

        <Card className="h-fit xl:col-span-4">
          <CardHeader title="Access status" subtitle="Account lifecycle controls" />
          <div className="space-y-4 p-5">
            {userId ? (
              <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <span>
                  <span className="block text-sm font-medium text-slate-900">Active account</span>
                  <span className="text-xs text-slate-500">Allow this user to sign in</span>
                </span>
                <input type="checkbox" className="size-4" {...register('isActive')} />
              </label>
            ) : (
              <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
                New users are active immediately after creation.
              </div>
            )}

            {userId && (
              <Button type="button" variant="secondary" className="w-full" onClick={() => setShowReset((value) => !value)}>
                <KeyRound size={16} />Reset password
              </Button>
            )}
          </div>
        </Card>
      </form>

      {userId && showReset && (
        <Card className="mt-6">
          <CardHeader title="Reset password" subtitle="Set a new temporary password for this user" />
          <form onSubmit={resetPasswordForm.handleSubmit((data) => resetPassword.mutate(data))} className="grid gap-5 p-5 md:grid-cols-2">
            <FormField label="New password">
              <PasswordInput {...resetPasswordForm.register('newPassword', { required: true, minLength: 8 })} />
            </FormField>
            <FormField label="Confirm password">
              <PasswordInput {...resetPasswordForm.register('confirmPassword', { required: true })} />
            </FormField>
            <div className="flex justify-end gap-2 md:col-span-2">
              <Button type="button" variant="secondary" onClick={() => setShowReset(false)}>Cancel</Button>
              <Button disabled={resetPassword.isPending}>{resetPassword.isPending ? 'Resetting…' : 'Reset password'}</Button>
            </div>
          </form>
        </Card>
      )}
    </>
  )
}
