"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { Subscription } from '@/types/api'
import { useAuth } from '@/contexts/auth-context'
import { StatusBadge } from '@/components/ui/status-badge'
import { LoadingPage } from '@/components/ui/loading'
import { PageHeader } from '@/components/dashboard/shared/page-header'
import { ResponsiveListView } from '@/components/dashboard/shared/responsive-list-view'
import { EmptyState } from '@/components/dashboard/shared/empty-state'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { showAlert } from '@/lib/utils/alert'
import { confirm } from '@/lib/utils/confirm'

export default function SubscriptionsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadData()
  }, [user, router])

  const loadData = async () => {
    try {
      const subs = await apiClient.subscriptions.findAll()
      setSubscriptions(Array.isArray(subs) ? subs : [])
    } catch (err) {
      console.error('Failed to load subscriptions:', err)
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id: string) => {
    if (!(await confirm('Cancel this subscription?'))) return
    try {
      await apiClient.subscriptions.cancel(id)
      loadData()
    } catch (err) {
      showAlert({ description: err instanceof Error ? err.message : 'Failed to cancel', variant: 'error' })
    }
  }

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Billing"
        description="Manage services and subscriptions"
      />

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

      {subscriptions.length === 0 ? (
        <EmptyState
          message="No subscriptions yet"
          action={{
            label: 'Browse Services',
            onClick: () => router.push('/dashboard/billing/services'),
          }}
        />
      ) : (
        <ResponsiveListView
          items={subscriptions}
          columns={[
            { key: 'service', header: 'Service', render: (sub: Subscription) => <span className="font-medium">{sub.service?.name || 'Unknown Service'}</span> },
            { key: 'status', header: 'Status', render: (sub: Subscription) => <StatusBadge status={sub.status} /> },
            { key: 'startDate', header: 'Start Date', render: (sub: Subscription) => sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '-' },
            { key: 'endDate', header: 'End Date', render: (sub: Subscription) => sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '-' },
            { key: 'remainingDays', header: 'Remaining Days', render: (sub: Subscription) => {
              const remainingDays = sub.endDate && sub.status === 'active' 
                ? Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                : null
              return remainingDays !== null ? `${remainingDays} days` : '-'
            }},
            { key: 'maxProducts', header: 'Max Products', render: (sub: Subscription) => {
              return sub.service 
                ? (sub.service.maxProducts === null ? 'Unlimited' : `${sub.service.maxProducts} / day`)
                : '-'
            }},
          ]}
          actions={(sub: Subscription) => ({
            onCancel: sub.status === 'active' ? () => handleCancel(sub.id) : undefined,
          })}
          mobileCardTitle={(sub: Subscription) => sub.service?.name || 'Unknown Service'}
          mobileCardDescription={(sub: Subscription) => (
            <div className="space-y-1">
              <div className="text-xs">
                Status: <StatusBadge status={sub.status} />
              </div>
              {sub.startDate && <div className="text-xs text-muted-foreground">Start: {new Date(sub.startDate).toLocaleDateString()}</div>}
              {sub.endDate && <div className="text-xs text-muted-foreground">End: {new Date(sub.endDate).toLocaleDateString()}</div>}
              {(() => {
                const remainingDays = sub.endDate && sub.status === 'active' 
                  ? Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                  : null
                return remainingDays !== null ? <div className="text-xs text-muted-foreground">Remaining: <span className="font-medium">{remainingDays} days</span></div> : null
              })()}
              {sub.service && <div className="text-xs text-muted-foreground">Max Products: {sub.service.maxProducts === null ? 'Unlimited' : `${sub.service.maxProducts} / day`}</div>}
            </div>
          )}
          mobileCardContent={(sub: Subscription) => null}
        />
      )}
    </div>
  )
}
