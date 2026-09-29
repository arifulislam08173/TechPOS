import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '../api/auth'
import { AUTH_STORAGE_KEY } from '../api/client'
import type { CurrentUser, LoginResponse } from '../types/auth'
import type { PermissionCode } from './permissions'

type AuthContextValue = {
  user: CurrentUser | null
  accessToken: string | null
  isInitializing: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  setCurrentUser: (user: CurrentUser) => void
  hasPermission: (...permissions: (PermissionCode | string)[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isInitializing, setInitializing] = useState(true)

  const clear = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    setUser(null)
    setAccessToken(null)
  }

  const persistUser = (nextUser: CurrentUser) => {
    setUser(nextUser)
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw) as LoginResponse
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...saved, user: nextUser }))
  }

  const refreshUser = async () => {
    const nextUser = await authApi.me()
    persistUser(nextUser)
  }

  useEffect(() => {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) {
      setInitializing(false)
      return
    }

    try {
      const saved = JSON.parse(raw) as LoginResponse
      setAccessToken(saved.accessToken)
      setUser(saved.user)
      authApi.me().then(persistUser).catch(clear).finally(() => setInitializing(false))
    } catch {
      clear()
      setInitializing(false)
    }
  }, [])

  useEffect(() => {
    const handler = () => clear()
    window.addEventListener('techpos:unauthorized', handler)
    return () => window.removeEventListener('techpos:unauthorized', handler)
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password)
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data))
    setAccessToken(data.accessToken)
    setUser(data.user)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isInitializing,
      login,
      logout: clear,
      refreshUser,
      setCurrentUser: persistUser,
      hasPermission: (...permissions) =>
        !!user && permissions.every((permission) => user.permissions.includes(permission)),
    }),
    [user, accessToken, isInitializing],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be inside AuthProvider')
  return context
}
