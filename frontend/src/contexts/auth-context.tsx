"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { User, AuthContextType } from '@/types/auth'
import { LoadingPage } from '@/components/ui/loading'

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const publicRoutes = ['/', '/enterprise/login', '/agent/login', '/trace']

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isPublic = publicRoutes.includes(pathname) || pathname.startsWith('/trace')

  const getLoginPath = useCallback((path: string) => {
    return path.startsWith('/agent/') ? '/agent/login' : '/enterprise/login'
  }, [])

  const getDashboardPath = useCallback((u: User | null) => {
    if (!u?.role) return '/enterprise/dashboard'
    if (u.role === 'AGENT') return '/agent/dashboard'
    return '/enterprise/dashboard'
  }, [])

  const isAnyDashboardPath = (path: string) => {
    return (
      path === '/dashboard' ||
      path.startsWith('/dashboard/') ||
      path === '/enterprise/dashboard' ||
      path.startsWith('/enterprise/dashboard/') ||
      path === '/agent/dashboard' ||
      path.startsWith('/agent/dashboard/')
    )
  }

  const checkAuth = useCallback(async (): Promise<User | null> => {
    try {
      const data = await authApi.getMe()
      setUser(data.user)
      return data.user
    } catch {
      setUser(null)
      if (!isPublic) router.push(getLoginPath(pathname))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getLoginPath, isPublic, pathname, router])

  useEffect(() => {
    let cancelled = false
    
    if (user && isAnyDashboardPath(pathname)) {
      return
    }
    
    setIsLoading(true)
    checkAuth().then((authedUser) => {
      if (cancelled) return
      
      const target = getDashboardPath(authedUser)
      const success = !!authedUser

      if (success && isPublic) {
        router.replace(target)
      } else if (success && !isAnyDashboardPath(pathname)) {
        router.replace(target)
      } else if (success && pathname === '/dashboard') {
        router.replace(target)
      } else if (!success && !isPublic) {
        router.push(getLoginPath(pathname))
      } else {
        setIsLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [pathname, isPublic, router, user, checkAuth, getDashboardPath])

  const refreshAuth = async () => {
    setIsLoading(true)
    try {
      const data = await authApi.getMe()
      setUser(data.user)
      return data
    } catch {
      setUser(null)
      if (!isPublic) router.push(getLoginPath(pathname))
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setUser(null)
    setIsLoading(false)
    try {
      await authApi.logout()
    } catch {}
    window.location.href = getLoginPath(pathname)
  }

  if (isLoading && !isPublic) {
    return <LoadingPage />
  }

  return <AuthContext.Provider value={{ user, isLoading, logout, refreshAuth }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
