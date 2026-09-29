import type { ReactNode } from 'react'
import { useAuth } from './AuthProvider'
import type { PermissionCode } from './permissions'

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: PermissionCode | string
  children: ReactNode
  fallback?: ReactNode
}) {
  const { hasPermission } = useAuth()
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>
}
