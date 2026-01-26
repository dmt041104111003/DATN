"use client"

import { useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { LoadingPage } from '@/components/ui/loading'
import Image from 'next/image'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SubscriptionTable } from './table'

export function List() {
  const router = useRouter()
  const pathname = usePathname()
  const { items: subscriptions, loading, handleCancel } = useSubscriptions()

  const currentTab = useMemo(() => {
    if (pathname === '/dashboard/billing/subscriptions' || pathname.startsWith('/dashboard/billing/subscriptions/')) {
      return 'subscriptions'
    }
    if (pathname === '/dashboard/billing/services' || pathname.startsWith('/dashboard/billing/services/')) {
      return 'services'
    }
    return undefined
  }, [pathname])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">Manage services and subscriptions</p>
      </div>

      <Tabs value={currentTab} onValueChange={(value) => {
        if (value === 'services') {
          router.push('/dashboard/billing/services')
        } else if (value === 'subscriptions') {
          router.push('/dashboard/billing/subscriptions')
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
        <div className="flex flex-col items-center justify-center py-8">
          <Image
            src="/404.png"
            alt="404"
            height={500}
            width={750}
            className="mx-auto opacity-80"
          />
          <p className="-mt-2 text-xl text-muted-foreground">No subscriptions found</p>
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
