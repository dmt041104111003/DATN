"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Service, Subscription } from '@/types/api'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/status-badge'
import { LoadingPage } from '@/components/ui/loading'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ServiceCard } from '@/components/ui/service-card'
import { BillingDialogCard } from '@/components/dashboard/billing-dialog-card'
import { PageHeader } from '@/components/dashboard/page-header'
import { ResponsiveListView } from '@/components/dashboard/responsive-list-view'
import { EmptyState } from '@/components/dashboard/empty-state'

type Tab = 'services' | 'subscriptions'

export default function BillingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('services')
  const [services, setServices] = useState<Service[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadData()
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [user, router])

  const loadData = async () => {
    try {
      const [servicesData, subsData] = await Promise.all([
        apiClient.services.findAll(),
        apiClient.subscriptions.findAll()
      ])
      setServices(servicesData || [])
      setSubscriptions(subsData || [])
    } catch {} finally {
      setLoading(false)
    }
  }

  const checkWalletBalance = async (walletInstance: any, requiredAmountADA: number): Promise<boolean> => {
    try {
      const utxos = await walletInstance.getUtxos()
      let totalLovelace = BigInt(0)
      
      for (const utxo of utxos) {
        const lovelace = utxo.output.amount.find((a: any) => a.unit === 'lovelace')
        if (lovelace) {
          totalLovelace += BigInt(lovelace.quantity)
        }
      }
      
      const totalADA = Number(totalLovelace) / 1_000_000
      const requiredAmount = requiredAmountADA + 0.2
      
      return totalADA >= requiredAmount
    } catch {
      return false
    }
  }

  const handleSubscribe = async (serviceId: string) => {
    if (!user?.address) {
      router.push('/login')
      return
    }

    const service = services.find(s => s.id === serviceId)
    if (!service) return

    setProcessing(serviceId)
    try {
      if (!user.walletName) {
        throw new Error('Wallet not found. Please login again.')
      }

      const { BrowserWallet } = await import('@meshsdk/core')
      const walletInstance = await BrowserWallet.enable(user.walletName)

      const hasEnoughBalance = await checkWalletBalance(walletInstance, service.price)
      if (!hasEnoughBalance) {
        throw new Error('Insufficient balance. Please add more ADA to your wallet.')
      }

      const amountLovelace = (service.price * 1_000_000).toString()
      const paymentResponse = await apiClient.contract.payment(user.address, amountLovelace)
      if (!paymentResponse.result) {
        throw new Error(paymentResponse.message)
      }

      const signedTx = await walletInstance.signTx(paymentResponse.data)
      const txHash = await walletInstance.submitTx(signedTx)
      
      const payResponse = await apiClient.subscriptions.pay({
        servicePlanId: serviceId,
        txHash
      })

      if (!payResponse.result) {
        throw new Error(payResponse.message || 'Payment verification failed')
      }

      if (payResponse.data?.subscription?.status === 'pending') {
        alert(payResponse.message || 'Transaction submitted. Verification in progress...')
        await loadData()
        setActiveTab('subscriptions')
        
        const subscriptionId = payResponse.data.subscription.id
        let checkCount = 0
        const maxChecks = 20
        
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
        
        pollingIntervalRef.current = setInterval(async () => {
          try {
            checkCount++
            const subs = await apiClient.subscriptions.findAll()
            const sub = subs.find(s => s.id === subscriptionId)
            
            await loadData()
            
            if (sub && sub.status !== 'pending') {
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
                pollingIntervalRef.current = null
              }
              if (sub.status === 'active') {
                alert('Payment verified! Subscription activated.')
              } else if (sub.status === 'cancelled' || sub.status === 'expired') {
                alert('Payment verification failed.')
              }
              return
            }
            
            if (checkCount >= maxChecks) {
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
                pollingIntervalRef.current = null
              }
            }
          } catch (err) {
            console.error('Error checking subscription status:', err)
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
              pollingIntervalRef.current = null
            }
          }
        }, 2000)
      } else {
        alert(payResponse.message || 'Payment verified! Subscription activated.')
        await loadData()
        setActiveTab('subscriptions')
      }
    } catch (err) {
      const isCancelled = err instanceof Error && 
        ['declined', 'rejected', 'cancelled', 'User'].some(s => err.message.includes(s))
      if (!isCancelled) {
        alert(err instanceof Error ? err.message : 'Failed to subscribe')
      }
    } finally {
      setProcessing(null)
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this subscription?')) return
    try {
      await apiClient.subscriptions.cancel(id)
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel')
    }
  }

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Billing"
        description="Manage services and subscriptions"
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-4 sm:mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 justify-items-center items-start" style={{ display: 'grid' }}>
          {(() => {
            if (services.length === 0) return []
            
            const sortedByPrice = [...services].sort((a, b) => a.price - b.price)
            const highestPriceService = sortedByPrice[sortedByPrice.length - 1]
            const otherServices = sortedByPrice.filter(s => s.id !== highestPriceService.id)
            
            let sortedServices: typeof services = []
            if (services.length === 3) {
              sortedServices = [otherServices[0], highestPriceService, otherServices[1]]
            } else if (services.length === 2) {
              sortedServices = [otherServices[0], highestPriceService]
            } else if (services.length > 3) {
              const midIndex = Math.floor(otherServices.length / 2)
              sortedServices = [...otherServices.slice(0, midIndex), highestPriceService, ...otherServices.slice(midIndex)]
            } else {
              sortedServices = sortedByPrice
            }
            
            return sortedServices.map((service, index) => {
            const activeSub = subscriptions.find(s => s.status === 'active')
            const hasActive = subscriptions.some(s => s.servicePlanId === service.id && s.status === 'active')
            const hasPending = subscriptions.some(s => s.servicePlanId === service.id && s.status === 'pending')
            const isSamePlan = activeSub && activeSub.servicePlanId === service.id
            const isUpgrade = activeSub && service.price > (activeSub.service?.price || 0)
            const isLowerPlan = activeSub && service.price < (activeSub.service?.price || 0)
            const isDisabled = hasActive || isSamePlan || isLowerPlan || processing === service.id || hasPending
            
            let buttonText = ''
            if (hasActive) {
              buttonText = 'Active'
            } else if (hasPending) {
              buttonText = 'Verifying...'
            } else if (isSamePlan) {
              buttonText = 'Renew Not Allowed'
            } else if (isLowerPlan) {
              buttonText = 'Lower Plan Not Available'
            } else {
              buttonText = processing === service.id ? 'Processing...' : isUpgrade ? 'Upgrade' : 'Subscribe'
            }
            
            const durationText = service.duration ? `${service.duration} ${service.duration === 1 ? 'day' : 'days'}` : 'N/A'
            const productText = service.maxProducts === null ? 'Unlimited / ngày' : service.maxProducts ? `${service.maxProducts} products / ngày` : 'N/A'
            
            const isFeatured = service.id === highestPriceService?.id
            const originalIndex = services.findIndex(s => s.id === service.id)
            
            let orderValue: number | undefined
            if (services.length === 3) {
              if (isFeatured) {
                orderValue = 2
              } else if (index === 0) {
                orderValue = 1
              } else {
                orderValue = 3
              }
            }
            
            return (
              <div key={service.id} style={orderValue ? { order: orderValue } : undefined} className="h-full">
                <ServiceCard
                  name={service.name}
                  description={service.description || undefined}
                  price={service.price}
                  duration={durationText}
                  product={productText}
                  isActive={hasActive}
                  disabled={isDisabled}
                  buttonText={buttonText}
                  onClick={() => {
                    if (!isDisabled) {
                      setSelectedService(service)
                      setDetailOpen(true)
                    }
                  }}
                  className={cn(
                    isDisabled && !hasActive && 'opacity-60',
                    isFeatured && 'md:-mt-4 md:mb-4'
                  )}
                  isFeatured={isFeatured}
                  variant={(originalIndex % 3) as 0 | 1 | 2}
                />
              </div>
            )
          })})()}
        </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-4 sm:mt-6">
          {subscriptions.length === 0 ? (
            <EmptyState
              message="No subscriptions yet"
              action={{
                label: 'Browse Services',
                onClick: () => setActiveTab('services'),
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
        </TabsContent>
      </Tabs>

      {detailOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDetailOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <BillingDialogCard
              service={selectedService}
              onSubscribe={() => {
                setDetailOpen(false)
                handleSubscribe(selectedService.id)
              }}
              processing={processing === selectedService.id}
            />
          </div>
        </div>
      )}
    </div>
  )
}
