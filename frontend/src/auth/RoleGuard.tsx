import type { ReactNode } from 'react'; import { useAuth } from './AuthProvider'; import type { UserRole } from '../types/auth'
export function RoleGuard({roles,children,fallback=null}:{roles:UserRole[];children:ReactNode;fallback?:ReactNode}){ const {user}=useAuth(); return user&&roles.includes(user.role)?children:fallback }
