"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Users,
  Boxes,
  Image as ImageIcon,
  CreditCard,
  Award,
  LogOut,
} from 'lucide-react'
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { useAuth } from '@/contexts/auth-context'
import { productsApi } from '@/lib/api/products'
import { ProductQuota } from '@/types/product'
import { subscriptionsApi } from '@/lib/api/subscriptions'
import { Subscription } from '@/types/subscription'

const menuItems = [
  {
    title: 'Main',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Products',
    items: [
      {
        title: 'Products',
        url: '/dashboard/products',
        icon: Package,
      },
    ],
  },
  {
    title: 'Supply Chain',
    items: [
      {
        title: 'Suppliers',
        url: '/dashboard/suppliers',
        icon: Users,
      },
      {
        title: 'Materials',
        url: '/dashboard/materials',
        icon: Boxes,
      },
    ],
  },
  {
    title: 'Production',
    items: [
      {
        title: 'Certifications',
        url: '/dashboard/certifications',
        icon: Award,
      },
    ],
  },
  {
    title: 'Media',
    items: [
      {
        title: 'Media',
        url: '/dashboard/media',
        icon: ImageIcon,
      },
    ],
  },
  {
    title: 'Billing',
    items: [
      {
        title: 'Billing',
        url: '/dashboard/billing/services',
        icon: CreditCard,
      },
    ],
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const [quota, setQuota] = useState<ProductQuota | null>(null)
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [quotaData, subscriptions] = await Promise.all([
          productsApi.getQuota(),
          subscriptionsApi.findAll()
        ])
        setQuota(quotaData)
        
        // Tìm subscription active
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

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border">
        {user && (
          <div className="px-2 pb-4 space-y-2">
            <div className="text-xs">
              <div className="text-muted-foreground mb-1">Address:</div>
              <div className="font-mono text-xs break-all">{formatAddress(user.address)}</div>
            </div>
            {quota && (
              <div className="text-xs">
                <div className="text-muted-foreground mb-1">Quota:</div>
                <div className="text-xs">
                  <span className="font-medium">{quota.tier}</span>
                  {' - '}
                  <span>
                    {quota.usedProducts}
                    {quota.maxProducts !== null ? ` / ${quota.maxProducts}` : ' / ∞'}
                  </span>
                </div>
              </div>
            )}
            {activeSubscription && activeSubscription.endDate && (
              <div className="text-xs">
                <div className="text-muted-foreground mb-1">Duration:</div>
                <div className="text-xs">
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
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group, groupIndex) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link href={item.url}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
            {groupIndex < menuItems.length - 1 && <SidebarSeparator />}
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Logout">
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  )
}
