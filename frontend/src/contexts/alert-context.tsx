"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { Alert } from '@/components/ui/alert'
import { setGlobalAlert } from '@/lib/utils/alert'

interface AlertMessage {
  id: string
  title?: string
  description: string
  variant?: 'default' | 'success' | 'warning' | 'error'
}

interface AlertContextType {
  showAlert: (message: string | AlertMessage) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertMessage[]>([])

  const showAlert = useCallback((message: string | { title?: string; description: string; variant?: 'default' | 'success' | 'warning' | 'error' }) => {
    const alert: AlertMessage = typeof message === 'string'
      ? { id: Date.now().toString(), description: message }
      : { id: Date.now().toString(), description: message.description, title: message.title, variant: message.variant }

    setAlerts((prev) => [...prev, alert])

    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== alert.id))
    }, 5000)
  }, [])

  useEffect(() => {
    setGlobalAlert(showAlert)
    return () => setGlobalAlert(null)
  }, [showAlert])

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            title={alert.title}
            description={alert.description}
            variant={alert.variant}
            onClose={() => removeAlert(alert.id)}
            className="min-w-[300px] shadow-lg"
          />
        ))}
      </div>
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
