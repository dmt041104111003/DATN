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

  useEffect(() => {
    if (isPublic) {
      setIsLoading(false)
      return
    }

    let cancelled = false
    const checkAuth = async () => {
      try {
        const data = await apiClient.getMe()
        if (!cancelled) setUser(data.user)
      } catch {
        if (!cancelled) {
          setUser(null)
          router.push('/login')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    checkAuth()
    return () => { cancelled = true }
  }, [pathname, isPublic, router])

  const logout = () => {
    apiClient.logout().catch()
    setUser(null)
    router.push('/login')
  }

  if (isLoading && !isPublic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return <AuthContext.Provider value={{ user, isLoading, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
