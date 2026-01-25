"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Service, Subscription } from '@/types/api'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ActionsDropdown } from '@/components/ui/actions-dropdown'
import { StatusBadge } from '@/components/ui/status-badge'
import { LoadingPage } from '@/components/ui/loading'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ServiceCard } from '@/components/ui/service-card'

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

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Manage services and subscriptions</p>
      </div>

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
            const isSamePlan = activeSub && activeSub.servicePlanId === service.id
            const isUpgrade = activeSub && service.price > (activeSub.service?.price || 0)
            const isLowerPlan = activeSub && service.price < (activeSub.service?.price || 0)
            const isDisabled = hasActive || isSamePlan || isLowerPlan || processing === service.id
            
            let buttonText = ''
            if (hasActive) {
              buttonText = 'Active'
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
              <ServiceCard
                key={service.id}
                name={service.name}
                description={service.description || undefined}
                price={service.price}
                duration={durationText}
                product={productText}
                isActive={hasActive}
                disabled={isDisabled}
                buttonText={buttonText}
                onClick={() => !isDisabled && handleSubscribe(service.id)}
                className={cn(
                  isDisabled && !hasActive && 'opacity-60',
                  isFeatured && 'md:-mt-4 md:mb-4'
                )}
                style={orderValue ? { order: orderValue } : undefined}
                isFeatured={isFeatured}
                variant={(originalIndex % 3) as 0 | 1 | 2}
              />
            )
          })})()}
        </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-4 sm:mt-6">
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
            <>
              <div className="hidden md:block border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Remaining Days</TableHead>
                      <TableHead>Max Products</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => {
                      const remainingDays = sub.endDate && sub.status === 'active' 
                        ? Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                        : null

                      return (
                        <TableRow key={sub.id} className={sub.status === 'active' ? 'bg-primary/5' : ''}>
                          <TableCell className="font-medium">{sub.service?.name || 'Unknown Service'}</TableCell>
                          <TableCell>
                            <StatusBadge status={sub.status} />
                          </TableCell>
                          <TableCell>{sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>{remainingDays !== null ? `${remainingDays} days` : '-'}</TableCell>
                          <TableCell>
                            {sub.service 
                              ? (sub.service.maxProducts === null ? 'Unlimited' : `${sub.service.maxProducts} / day`)
                              : '-'
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            {sub.status === 'active' && (
                              <ActionsDropdown
                                onCancel={() => handleCancel(sub.id)}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="md:hidden space-y-2">
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
                              Status: <StatusBadge status={sub.status} />
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
            </>
          )}
        </>
        </TabsContent>
      </Tabs>
    </div>
  )
}
