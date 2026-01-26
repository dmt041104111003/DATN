"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { User, AuthContextType } from '@/types/auth'
import { LoadingPage } from '@/components/ui/loading'

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const publicRoutes = ['/', '/login', '/trace']

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isPublic = publicRoutes.includes(pathname) || pathname.startsWith('/trace')

  const checkAuth = useCallback(async () => {
    try {
      const data = await authApi.getMe()
      setUser(data.user)
      return true
    } catch {
      setUser(null)
      if (!isPublic) router.push('/login')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isPublic, router])

  useEffect(() => {
    let cancelled = false
    
    if (user && pathname.startsWith('/dashboard')) {
      return
    }
    
    setIsLoading(true)
    checkAuth().then((success) => {
      if (cancelled) return
      
      if (success && isPublic) {
        router.push('/dashboard')
      } else if (success && !pathname.startsWith('/dashboard')) {
        router.push('/dashboard')
      } else if (!success && !isPublic) {
        router.push('/login')
      } else {
        setIsLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [pathname, isPublic, router, user, checkAuth])

  const refreshAuth = async () => {
    setIsLoading(true)
    try {
      const data = await authApi.getMe()
      setUser(data.user)
    } catch {
      setUser(null)
      if (!isPublic) router.push('/login')
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
    window.location.href = '/'
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
