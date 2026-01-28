"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BiHome,
  BiPackage,
  BiGroup,
  BiBox,
  BiUserCircle,
  BiAward,
  BiImage,
  BiCreditCard,
  BiLogOut,
} from 'react-icons/bi'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { MenuToggle } from '@/components/ui/menu-toggle'
import { useAuth } from '@/contexts/auth-context'
import { productsApi } from '@/lib/api/products'
import { ProductQuota } from '@/types/product'
import { subscriptionsApi } from '@/lib/api/subscriptions'
import { Subscription } from '@/types/subscription'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: BiHome,
  },
  {
    title: 'Products',
    url: '/dashboard/products',
    icon: BiPackage,
  },
  {
    title: 'Suppliers',
    url: '/dashboard/suppliers',
    icon: BiGroup,
  },
  {
    title: 'Materials',
    url: '/dashboard/materials',
    icon: BiBox,
  },
  {
    title: 'Agents',
    url: '/dashboard/agents',
    icon: BiUserCircle,
  },
  {
    title: 'Certifications',
    url: '/dashboard/certifications',
    icon: BiAward,
  },
  {
    title: 'Media',
    url: '/dashboard/media',
    icon: BiImage,
  },
  {
    title: 'Billing',
    url: '/dashboard/billing/services',
    icon: BiCreditCard,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [quota, setQuota] = useState<ProductQuota | null>(null)
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const delayMsRef = useRef(3000)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [quotaData, subscriptions] = await Promise.all([
          productsApi.getQuota(),
          subscriptionsApi.findAll()
        ])
        setQuota(quotaData)
        
        const active = subscriptions.find((sub: Subscription) => sub.status === 'active')
        setActiveSubscription(active || null)
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }

    if (user) {
      loadData()
    }
  }, [user])

  useEffect(() => {
    const stop = () => {
      if (!timerRef.current) return
      clearTimeout(timerRef.current)
      timerRef.current = null
      delayMsRef.current = 3000
    }

    const schedule = () => {
      if (timerRef.current) return

      timerRef.current = setTimeout(async () => {
        timerRef.current = null

        try {
          const subscriptions = await subscriptionsApi.findAll()
          const active = subscriptions.find((sub: Subscription) => sub.status === 'active')
          setActiveSubscription(active || null)

          const hasPending = subscriptions.some((sub: Subscription) => sub.status === 'pending')
          if (!hasPending) {
            const quotaData = await productsApi.getQuota()
            setQuota(quotaData)
            stop()
            return
          }

          delayMsRef.current = Math.min(Math.round(delayMsRef.current * 1.5), 15000)
          schedule()
        } catch (error) {
          console.error('Failed to load data:', error)
          delayMsRef.current = Math.min(Math.round(delayMsRef.current * 1.5), 15000)
          schedule()
        }
      }, delayMsRef.current)
    }

    if (!user) {
      stop()
      return
    }

    schedule()
    return () => {
      stop()
    }
  }, [user])

  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getRemainingDays = (endDate?: string): number | null => {
    if (!endDate) return null
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {isMobile && (
        <div className="p-4 border-b flex justify-end">
          <MenuToggle checked={open} onCheckedChange={setOpen} />
        </div>
      )}
      {user && (
        <div className="p-6 border-b space-y-3">
          <div className="text-sm">
            <div className="text-muted-foreground mb-2 text-xs">Address:</div>
            <div className="font-mono text-sm break-all">{formatAddress(user.address)}</div>
          </div>
          {quota && quota.maxProducts !== null && (
            <div className="text-sm">
              <div className="text-muted-foreground mb-2 text-xs">Quota:</div>
              <div className="text-sm">
                <span className="font-medium">{quota.tier}</span>
                {' - '}
                <span>
                  {quota.usedProducts}
                  {` / ${quota.maxProducts}`}
                </span>
              </div>
            </div>
          )}
          {activeSubscription && activeSubscription.endDate && (
            <div className="text-sm">
              <div className="text-muted-foreground mb-2 text-xs">Duration:</div>
              <div className="text-sm">
                {(() => {
                  const remainingDays = getRemainingDays(activeSubscription.endDate)
                  if (remainingDays === null) return '-'
                  if (remainingDays === 0) return 'Expired'
                  return `${remainingDays} day${remainingDays !== 1 ? 's' : ''} remaining`
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
            return (
              <li key={item.title}>
                <Link
                  href={item.url}
                  className={cn(
                    "flex items-center gap-x-4 py-3 px-4 text-base rounded-lg",
                    isActive 
                      ? "bg-gray-100 text-gray-900 font-medium" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => isMobile && setOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="w-full flex items-center gap-x-4 py-3 px-4 text-base text-gray-700 rounded-lg hover:bg-gray-100"
        >
          <BiLogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <div className="bg-white rounded-full shadow-lg p-3 border border-gray-200">
            <MenuToggle checked={open} onCheckedChange={setOpen} />
          </div>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent 
            side="left" 
            noAnimation
            showCloseButton={false}
            className="w-72 p-0"
          >
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:h-screen lg:fixed lg:top-0 lg:left-0 lg:z-50 bg-white border-r border-gray-200">
      {sidebarContent}
    </aside>
  )
}
