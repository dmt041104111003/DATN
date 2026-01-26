"use client"

import { useState, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useServices } from '@/hooks/useServices'
import { Service } from '@/types/subscription'
import { cn } from '@/lib/utils'
import { LoadingPage } from '@/components/ui/loading'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ServiceCard } from '@/components/ui/service-card'
import { BillingDialogCard } from '@/components/dashboard/billing/billing-dialog-card'

export function List() {
  const router = useRouter()
  const pathname = usePathname()
  const { items: services, subscriptions, loading, processing, handleSubscribe } = useServices()
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const currentTab = useMemo(() => {
    if (pathname === '/dashboard/billing/subscriptions' || pathname.startsWith('/dashboard/billing/subscriptions/')) {
      return 'subscriptions'
    }
    if (pathname === '/dashboard/billing/services' || pathname.startsWith('/dashboard/billing/services/')) {
      return 'services'
    }
    return undefined
  }, [pathname])

  if (loading) return <LoadingPage />

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
          const productText = service.maxProducts === null ? 'Unlimited / day' : service.maxProducts ? `${service.maxProducts} products / day` : 'N/A'
          
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

      {services.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No services available</p>
        </div>
      )}

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
