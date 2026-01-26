"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function MediaPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    // Redirect to files page by default
    router.replace('/dashboard/media/files')
  }, [user, router])

  return null
}
