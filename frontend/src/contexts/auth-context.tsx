"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { User, AuthContextType } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const publicRoutes = ['/', '/login']

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isPublic = publicRoutes.includes(pathname)

  const checkAuth = async () => {
    try {
      const data = await apiClient.getMe()
      setUser(data.user)
      return true
    } catch {
      setUser(null)
      if (!isPublic) router.push('/login')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
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
  }, [pathname, isPublic, router])

  const refreshAuth = async () => {
    setIsLoading(true)
    await checkAuth()
  }

  const logout = () => {
    apiClient.logout().catch()
    setUser(null)
    router.push('/login')
  }

  if (isLoading && !isPublic) {
    return <div className="min-h-screen bg-white" />
  }

  return <AuthContext.Provider value={{ user, isLoading, logout, refreshAuth }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
