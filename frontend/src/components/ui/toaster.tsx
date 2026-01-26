"use client"

import { Toast } from "./toast"

interface ToastMessage {
  id: string
  title?: string
  description: string
  variant?: 'default' | 'success' | 'warning' | 'error'
}

interface ToasterProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 max-w-3xl mx-auto sm:left-auto sm:right-4">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  )
}
