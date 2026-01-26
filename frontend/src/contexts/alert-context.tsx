"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { setGlobalAlert } from '@/lib/utils/alert'

interface ToastMessage {
  id: string
  title?: string
  description: string
  variant?: 'default' | 'success' | 'warning' | 'error'
}

interface AlertContextType {
  showAlert: (message: string | ToastMessage) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showAlert = useCallback((message: string | { title?: string; description: string; variant?: 'default' | 'success' | 'warning' | 'error' }) => {
    const description = typeof message === 'string' ? message : message.description
    
    setToasts((prev) => {
      const existingToast = prev.find(t => t.description === description && t.variant === (typeof message === 'string' ? undefined : message.variant))
      if (existingToast) {
        return prev
      }
      
      const toast: ToastMessage = typeof message === 'string'
        ? { id: `${Date.now()}-${Math.random()}`, description: message }
        : { id: `${Date.now()}-${Math.random()}`, description: message.description, title: message.title, variant: message.variant }

      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== toast.id))
      }, 5000)
      
      return [...prev, toast]
    })
  }, [])

  useEffect(() => {
    setGlobalAlert(showAlert)
    return () => setGlobalAlert(null)
  }, [showAlert])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Toaster toasts={toasts} onDismiss={removeToast} />
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider')
  }
  return context
}
