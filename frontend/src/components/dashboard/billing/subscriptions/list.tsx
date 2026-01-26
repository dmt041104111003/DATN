"use client"

import { useRouter } from 'next/navigation'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { LoadingPage } from '@/components/ui/loading'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SubscriptionTable } from './table'

export function List() {
  const router = useRouter()
  const { items: subscriptions, loading, handleCancel } = useSubscriptions()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage services and subscriptions</p>
      </div>

      <Tabs value="subscriptions" onValueChange={(value) => {
        if (value === 'services') {
          router.push('/dashboard/billing/services')
        }
      }}>
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <LoadingPage />
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No subscriptions yet</p>
          <button onClick={() => router.push('/dashboard/billing/services')} className="mt-4 text-primary">Browse Services</button>
        </div>
      ) : (
        <SubscriptionTable
          subscriptions={subscriptions}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
