"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Service, Subscription, Payment } from '@/types/api'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type Tab = 'services' | 'subscriptions' | 'payments'

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('services')
  const [services, setServices] = useState<Service[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribeOpen, setSubscribeOpen] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [servicesData, subsData, paymentsData] = await Promise.all([
        apiClient.services.findAll(),
        apiClient.subscriptions.findAll(),
        apiClient.payments.findAll()
      ])
      setServices(Array.isArray(servicesData) ? servicesData : [])
      setSubscriptions(Array.isArray(subsData) ? subsData : [])
      setPayments(Array.isArray(paymentsData) ? paymentsData : [])
    } catch (err) {
      console.error('Failed to load:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (serviceId: string) => {
    try {
      await apiClient.subscriptions.create({ servicePlanId: serviceId })
      setSubscribeOpen(null)
      loadData()
      setActiveTab('subscriptions')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to subscribe')
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

  const getActiveSubscription = (serviceId: string) => {
    return subscriptions.find(s => s.servicePlanId === serviceId && s.status === 'active')
  }

  if (loading) return <div className="space-y-6">Loading...</div>

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Manage services, subscriptions, and payments</p>
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
        <Button
          variant="ghost"
          onClick={() => setActiveTab('payments')}
          className={cn(
            "rounded-none border-b-2 border-transparent whitespace-nowrap text-sm sm:text-base transition-colors",
            activeTab === 'payments' && "border-primary text-primary font-semibold bg-accent/50"
          )}
        >
          Payments
        </Button>
      </div>

      {activeTab === 'services' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const activeSub = getActiveSubscription(service.id)
            const isActive = !!activeSub
            
            return (
              <Card key={service.id} className={cn("flex flex-col", isActive && 'border-primary')}>
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="text-lg sm:text-xl">{service.name}</CardTitle>
                  <CardDescription className="min-h-[2.5rem] sm:min-h-[3rem] line-clamp-2">
                    {service.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 space-y-4">
                  <div className="flex-shrink-0">
                    <p className="text-2xl sm:text-3xl font-bold">{service.price} ADA</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Duration: {service.duration} days
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Max Products: {service.maxProducts === null ? 'Unlimited' : service.maxProducts}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto pt-4">
                    {isActive ? (
                      <div className="space-y-2">
                        <p className="text-sm text-primary font-medium">Active Subscription</p>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('subscriptions')} className="w-full">
                          Manage
                        </Button>
                      </div>
                    ) : (
                      <Dialog open={subscribeOpen === service.id} onOpenChange={(open) => setSubscribeOpen(open ? service.id : null)}>
                        <DialogTrigger asChild>
                          <Button className="w-full">Subscribe</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Subscribe to {service.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2">
                            <p>Price: {service.price} ADA</p>
                            <p>Duration: {service.duration} days</p>
                            <p>Max Products: {service.maxProducts === null ? 'Unlimited' : service.maxProducts}</p>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setSubscribeOpen(null)}>Cancel</Button>
                            <Button onClick={() => handleSubscribe(service.id)}>Confirm</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
              {subscriptions.map((sub) => (
                <Card key={sub.id} className={sub.status === 'active' ? 'border-primary' : ''}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <CardTitle className="text-base sm:text-lg">{sub.service?.name || 'Unknown Service'}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Status: <span className={sub.status === 'active' ? 'text-primary font-medium' : ''}>{sub.status}</span>
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
                      {sub.startDate && (
                        <p>
                          <span className="text-muted-foreground">Start:</span>{' '}
                          {new Date(sub.startDate).toLocaleDateString()}
                        </p>
                      )}
                      {sub.endDate && (
                        <p>
                          <span className="text-muted-foreground">End:</span>{' '}
                          {new Date(sub.endDate).toLocaleDateString()}
                        </p>
                      )}
                      {sub.service && (
                        <>
                          <p>
                            <span className="text-muted-foreground">Price:</span> {sub.service.price} ADA
                          </p>
                          <p>
                            <span className="text-muted-foreground">Max Products:</span>{' '}
                            {sub.service.maxProducts === null ? 'Unlimited' : sub.service.maxProducts}
                          </p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'payments' && (
        <>
          {payments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No payments yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment #{payment.id.slice(0, 8)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">Amount:</span>{' '}
                        <span className="font-medium">{payment.amount} {payment.currency}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Date:</span>{' '}
                        {new Date(payment.paymentDate).toLocaleString()}
                      </p>
                      {payment.txHash && (
                        <p className="break-words">
                          <span className="text-muted-foreground">Transaction:</span>{' '}
                          <span className="font-mono text-xs break-all">{payment.txHash}</span>
                        </p>
                      )}
                      <p className="break-words">
                        <span className="text-muted-foreground">Subscription ID:</span>{' '}
                        <span className="font-mono text-xs break-all">{payment.subscriptionId}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
