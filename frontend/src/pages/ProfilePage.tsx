import { useMutation } from '@tanstack/react-query'
import { KeyRound, Save, ShieldCheck, UserCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth'
import { getApiError } from '../api/client'
import { useAuth } from '../auth/AuthProvider'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardHeader } from '../components/ui/Card'
import { FormField, inputClass } from '../components/ui/FormField'
import { PageHeader } from '../components/ui/PageHeader'
import { PasswordInput } from '../components/ui/PasswordInput'

type ProfileForm = { fullName: string; email: string }
type PasswordForm = { currentPassword: string; newPassword: string; confirmPassword: string }

export function ProfilePage() {
  const { user, setCurrentUser, logout } = useAuth()
  const profileForm = useForm<ProfileForm>({ values: { fullName: user?.fullName ?? '', email: user?.email ?? '' } })
  const passwordForm = useForm<PasswordForm>()

  const updateProfile = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (nextUser) => { setCurrentUser(nextUser); toast.success('Profile updated') },
    onError: (error) => toast.error(getApiError(error)),
  })

  const changePassword = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => { toast.success('Password changed. Please sign in again.'); passwordForm.reset(); window.setTimeout(logout, 700) },
    onError: (error) => toast.error(getApiError(error)),
  })

  return (
    <>
      <PageHeader title="Profile & security" subtitle="Manage your account identity, access context and password." />
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <Card><CardHeader title="Profile information" subtitle="Details used across the TechPOS workspace" /><form onSubmit={profileForm.handleSubmit((data) => updateProfile.mutate(data))} className="grid gap-5 p-5 md:grid-cols-2"><FormField label="Full name"><input className={inputClass} {...profileForm.register('fullName', { required: true, minLength: 2 })} /></FormField><FormField label="Email"><input type="email" className={inputClass} {...profileForm.register('email', { required: true })} /></FormField><div className="md:col-span-2 flex justify-end"><Button disabled={updateProfile.isPending}><Save size={16} />{updateProfile.isPending ? 'Saving…' : 'Save profile'}</Button></div></form></Card>
          <Card><CardHeader title="Change password" subtitle="Use your current password to set a new secure password" /><form onSubmit={passwordForm.handleSubmit((data) => changePassword.mutate(data))} className="grid gap-5 p-5 md:grid-cols-2"><div className="md:col-span-2"><FormField label="Current password"><PasswordInput {...passwordForm.register('currentPassword', { required: true })} /></FormField></div><FormField label="New password" hint="Use at least 8 characters with uppercase, lowercase and a number."><PasswordInput {...passwordForm.register('newPassword', { required: true, minLength: 8 })} /></FormField><FormField label="Confirm password"><PasswordInput {...passwordForm.register('confirmPassword', { required: true })} /></FormField><div className="md:col-span-2 flex justify-end"><Button disabled={changePassword.isPending}><KeyRound size={16} />{changePassword.isPending ? 'Changing…' : 'Change password'}</Button></div></form></Card>
        </div>
        <Card className="h-fit xl:col-span-4"><CardHeader title="Access summary" subtitle="Your current security context" /><div className="space-y-5 p-5"><div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600"><UserCircle size={24} /></div><div><p className="font-medium text-slate-900">{user?.fullName}</p><p className="text-sm text-slate-500">{user?.email}</p></div></div><div className="rounded-xl bg-slate-50 p-4"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">Role</span><Badge tone="blue">{user?.role}</Badge></div><div className="mt-3 flex items-center justify-between"><span className="text-sm text-slate-500">Permissions</span><span className="text-sm font-medium text-slate-900">{user?.permissions.length ?? 0}</span></div></div><div className="flex gap-3 rounded-xl border border-slate-200 p-4"><ShieldCheck className="mt-0.5 shrink-0 text-emerald-600" size={20} /><p className="text-xs leading-5 text-slate-500">Backend authorization validates your current role permissions on protected API requests. UI visibility is only a convenience layer.</p></div></div></Card>
      </div>
    </>
  )
}
