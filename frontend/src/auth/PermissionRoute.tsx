import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import type { PermissionCode } from './permissions'

export function PermissionRoute({ permission, children }: { permission: PermissionCode | string; children: ReactNode }) {
  const { hasPermission } = useAuth()
  return hasPermission(permission) ? <>{children}</> : <Navigate to="/" replace />
}
