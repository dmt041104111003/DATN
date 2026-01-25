import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'

export function useProductHistory(productId: string | undefined, open: boolean) {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && productId) {
      loadHistory()
    }
  }, [open, productId])

  const loadHistory = async () => {
    if (!productId) return
    setLoading(true)
    try {
      const data = await apiClient.products.getHistory(productId)
      setHistory(Array.isArray(data.history) ? data.history : [])
    } catch (err) {
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  return { history, loading }
}
