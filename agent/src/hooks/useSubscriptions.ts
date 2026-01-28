import { useState, useEffect } from 'react'
import { subscriptionsApi } from '@/lib/api/subscriptions'
import { Subscription } from '@/types/subscription'
import { showAlert } from '@/lib/utils/alert'
import { confirm } from '@/lib/utils/confirm'

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const data = await subscriptionsApi.findAll()
      setSubscriptions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load subscriptions:', err)
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCancel = async (id: string) => {
    if (!(await confirm('Cancel this subscription?'))) return
    try {
      await subscriptionsApi.cancel(id)
      await loadData()
    } catch (err) {
      showAlert({ description: err instanceof Error ? err.message : 'Failed to cancel', variant: 'error' })
    }
  }

  return {
    items: subscriptions,
    loading,
    handleCancel,
  }
}
