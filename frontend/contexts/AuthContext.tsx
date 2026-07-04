'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { AuthSession, LoginCredentials } from '@/types/auth'
import {
  clearSession,
  getStoredSession,
  login,
  storeSession,
} from '@/lib/auth'

interface AuthContextValue {
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (credentials: LoginCredentials) => Promise<'success' | 'access-denied' | 'failed'>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const PUBLIC_PATHS = ['/login', '/access-denied']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setSession(getStoredSession())
    setIsLoading(false)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
    router.replace('/login')
  }, [router])

  const signIn = useCallback(
    async (credentials: LoginCredentials): Promise<'success' | 'access-denied' | 'failed'> => {
      setIsLoading(true)

      try {
        const result = await login(credentials)

        if (!result.authorized || !result.token || !result.user) {
          clearSession()
          setSession(null)

          if (result.reason?.includes('Access denied')) {
            router.replace('/access-denied')
            return 'access-denied'
          }

          return 'failed'
        }

        const nextSession: AuthSession = {
          userId: result.user.id,
          username: result.user.username,
          email: result.user.email,
          phone: result.user.phone,
          token: result.token,
          appName: result.appName,
          roles: result.roles,
        }

        storeSession(nextSession)
        setSession(nextSession)
        router.replace('/')
        return 'success'
      } catch {
        clearSession()
        setSession(null)
        return 'failed'
      } finally {
        setIsLoading(false)
      }
    },
    [router]
  )

  useEffect(() => {
    if (isLoading) {
      return
    }

    const isPublicPath = PUBLIC_PATHS.includes(pathname)

    if (!session && !isPublicPath) {
      router.replace('/login')
      return
    }

    if (session && pathname === '/login') {
      router.replace('/')
    }
  }, [isLoading, pathname, router, session])

  const value = useMemo(
    () => ({
      session,
      isLoading,
      isAuthenticated: !!session,
      signIn,
      logout,
    }),
    [session, isLoading, signIn, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
