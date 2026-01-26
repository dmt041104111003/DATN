"use client"

import { useAlert } from '@/contexts/alert-context'

export function useShowAlert() {
  const { showAlert } = useAlert()
  return showAlert
}

let globalShowAlert: ((message: string | { title?: string; description: string; variant?: 'default' | 'success' | 'warning' | 'error' }) => void) | null = null

export function setGlobalAlert(showAlert: typeof globalShowAlert) {
  globalShowAlert = showAlert
}

export function showAlert(message: string | { title?: string; description: string; variant?: 'default' | 'success' | 'warning' | 'error' }) {
  if (globalShowAlert) {
    globalShowAlert(message)
  } else {
    const text = typeof message === 'string' ? message : message.description || message.title || ''
    window.alert(text)
  }
}
