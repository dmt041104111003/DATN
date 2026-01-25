"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Service, Subscription } from '@/types/api'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

type Tab = 'services' | 'subscriptions'

export default function BillingPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('services')
  const [services, setServices] = useState<Service[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

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

  const handleSubscribe = async (serviceId: string) => {
    if (!user?.address) {
      alert('Please connect your wallet first')
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

      const amountLovelace = (service.price * 1_000_000).toString()
      const paymentResponse = await apiClient.contract.payment(user.address, amountLovelace)
      if (!paymentResponse.result) {
        throw new Error(paymentResponse.message)
      }

      const signedTx = await walletInstance.signTx(paymentResponse.data)
      const txHash = await walletInstance.submitTx(signedTx)
      
      await apiClient.subscriptions.pay({
        servicePlanId: serviceId,
        txHash
      })

      alert('Transaction submitted. Verification in progress...')
      loadData()
      setActiveTab('subscriptions')
      
      const checkInterval = setInterval(async () => {
        try {
          const subs = await apiClient.subscriptions.findAll()
          const sub = subs.find(s => s.txHash === txHash)
          if (sub && sub.status !== 'pending') {
            clearInterval(checkInterval)
            loadData()
            if (sub.status === 'active') {
              alert('Payment verified! Subscription activated.')
            } else {
              alert('Payment verification failed.')
            }
          }
        } catch {}
      }, 3000)
      
      setTimeout(() => clearInterval(checkInterval), 60000)
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

  if (loading) return <div className="space-y-6">Loading...</div>

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Manage services and subscriptions</p>
      </div>

      <div className="flex gap-1 sm:gap-2 border-b overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <Button
          variant="ghost"
          onClick={() => setActiveTab('services')}
          className={cn(
            "rounded-none border-b-2 border-transparent whitespace-nowrap text-sm sm:text-base transition-colors",
            activeTab === 'services' && "border-primary text-primary font-semibold bg-accent/50"
          )}
        >
          Services
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab('subscriptions')}
          className={cn(
            "rounded-none border-b-2 border-transparent whitespace-nowrap text-sm sm:text-base transition-colors",
            activeTab === 'subscriptions' && "border-primary text-primary font-semibold bg-accent/50"
          )}
        >
          Subscriptions
        </Button>
      </div>

      {activeTab === 'services' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const activeSub = subscriptions.find(s => s.status === 'active')
            const hasActive = subscriptions.some(s => s.servicePlanId === service.id && s.status === 'active')
            const isSamePlan = activeSub && activeSub.servicePlanId === service.id
            const isUpgrade = activeSub && service.price > (activeSub.service?.price || 0)
            const isLowerPlan = activeSub && service.price < (activeSub.service?.price || 0)
            const isDisabled = hasActive || isSamePlan || isLowerPlan || processing === service.id
            
            return (
              <Card key={service.id} className={cn("flex flex-col", hasActive && 'border-primary', isDisabled && !hasActive && 'opacity-60')}>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">{service.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {service.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 space-y-4">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">{service.price} ADA</p>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>Duration: {service.duration} days</p>
                      <p>Max Products: {service.maxProducts === null ? 'Unlimited' : `${service.maxProducts} / day`}</p>
                    </div>
                  </div>
                  <div className="mt-auto pt-4 space-y-2">
                    {hasActive ? (
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        Active
                      </Button>
                    ) : isSamePlan ? (
                      <>
                        <Button variant="outline" size="sm" className="w-full" disabled>
                          Renew Not Allowed
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          Wait for current plan to expire
                        </p>
                      </>
                    ) : isLowerPlan ? (
                      <>
                        <Button variant="outline" size="sm" className="w-full" disabled>
                          Lower Plan Not Available
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          Upgrade to access higher tier plans
                        </p>
                      </>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => handleSubscribe(service.id)}
                        disabled={processing === service.id}
                      >
                        {processing === service.id ? 'Processing...' : isUpgrade ? 'Upgrade' : 'Subscribe'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <>
          {subscriptions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No subscriptions yet</p>
                <Button className="mt-4" onClick={() => setActiveTab('services')}>
                  Browse Services
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {subscriptions.map((sub) => {
                const remainingDays = sub.endDate && sub.status === 'active' 
                  ? Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                  : null

                return (
                  <Card key={sub.id} className={sub.status === 'active' ? 'border-primary' : ''}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <CardTitle className="text-base sm:text-lg">{sub.service?.name || 'Unknown Service'}</CardTitle>
                          <CardDescription className="text-xs sm:text-sm">
                            Status: <span className={cn(
                              sub.status === 'active' && 'text-primary font-medium',
                              sub.status === 'expired' && 'text-orange-600 font-medium',
                              sub.status === 'cancelled' && 'text-gray-500',
                              sub.status === 'pending' && 'text-yellow-600'
                            )}>{sub.status}</span>
                          </CardDescription>
                        </div>
                        {sub.status === 'active' && (
                          <Button variant="outline" size="sm" onClick={() => handleCancel(sub.id)} className="w-full sm:w-auto">
                            Cancel
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 text-sm">
                        {sub.startDate && <p><span className="text-muted-foreground">Start:</span> {new Date(sub.startDate).toLocaleDateString()}</p>}
                        {sub.endDate && <p><span className="text-muted-foreground">End:</span> {new Date(sub.endDate).toLocaleDateString()}</p>}
                        {remainingDays !== null && <p><span className="text-muted-foreground">Remaining:</span> <span className="font-medium">{remainingDays} days</span></p>}
                        {sub.service && <p><span className="text-muted-foreground">Max Products:</span> {sub.service.maxProducts === null ? 'Unlimited' : `${sub.service.maxProducts} / day`}</p>}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
