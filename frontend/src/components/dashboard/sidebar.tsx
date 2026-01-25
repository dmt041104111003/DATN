"use client"

import { memo, useMemo, useState, useEffect } from 'react'
import { 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { Icon } from "@/components/ui/icon"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api/client"

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { title: "Products", href: "/dashboard/products", icon: "inventory" },
  { title: "Materials", href: "/dashboard/materials", icon: "layers" },
  { title: "Collections", href: "/dashboard/collections", icon: "collections" },
  { title: "Warehouses", href: "/dashboard/warehouses", icon: "warehouse" },
  { title: "Media", href: "/dashboard/media", icon: "image" },
  { title: "Billing", href: "/dashboard/billing", icon: "payments" },
] as const

function DashboardSidebarComponent() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [plan, setPlan] = useState<string>('Free')
  const [used, setUsed] = useState<number>(0)
  const [max, setMax] = useState<number | null>(null)
  const [remainingDays, setRemainingDays] = useState<number | null>(null)

  const loadSubscriptionData = async () => {
    try {
      const [subs, quota] = await Promise.all([
        apiClient.subscriptions.findAll(),
        apiClient.products.getQuota()
      ])
      
      const active = subs.find(s => s.status === 'active')
      setPlan(active?.service?.name || 'Free')
      setRemainingDays(active?.endDate 
        ? Math.max(0, Math.ceil((new Date(active.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null)
      setUsed(quota.usedProducts)
      setMax(quota.maxProducts)
    } catch {}
  }

  useEffect(() => {
    loadSubscriptionData()
    const interval = setInterval(loadSubscriptionData, 3000)
    return () => clearInterval(interval)
  }, [])

  const activeStates = useMemo(() => menuItems.reduce((acc, item) => {
    acc[item.href] = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
    return acc
  }, {} as Record<string, boolean>), [pathname])

  return (
    <SidebarContent>
      <SidebarHeader className="border-b pb-4">
   
        <div className="space-y-3 p-3 rounded-lg bg-accent/50">
          <div className="flex items-center gap-2">
            <Icon name="account_circle" size="sm" className="text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">{user?.id ? `${user.id.slice(0, 8)}...` : 'ID'}</p>
              <p className="text-sm font-medium truncate">{user?.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="workspace_premium" size="sm" className="text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Plan</p>
              <p className="text-sm font-semibold">{plan}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Used: {used} / {max === null ? '∞' : max}</p>
              {remainingDays !== null && plan !== 'Free' && (
                <p className="text-xs text-muted-foreground mt-0.5">Duration: {remainingDays} days</p>
              )}
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => {
              const isActive = activeStates[item.href]
              return (
                <SidebarMenuItem key={item.href}>
                  <Link 
                    href={item.href}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md p-2 text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent font-semibold"
                    )}
                  >
                    <Icon 
                      name={item.icon} 
                      size="sm" 
                      className={cn(isActive ? "text-foreground" : "text-muted-foreground")}
                    />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarFooter className="border-t pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-md p-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Icon name="logout" size="sm" className="text-muted-foreground" />
              <span>Logout</span>
            </button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarContent>
  )
}

export const DashboardSidebar = memo(DashboardSidebarComponent)
