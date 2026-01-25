"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Icon } from "@/components/ui/icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/stores/auth.store"
import { authRepository } from "@/lib/api/auth.repository"
import { toast } from "sonner"

const manufacturerNav = [
  { title: "Dashboard", url: "/dashboard", icon: "dashboard" },
  { title: "Batches", url: "/batches", icon: "inventory_2" },
  { title: "Shipments", url: "/shipments", icon: "local_shipping" },
  { title: "Agents", url: "/agents", icon: "storefront" },
  { title: "Products", url: "/products", icon: "sell" },
  { title: "Certifications", url: "/certifications", icon: "verified" },
  { title: "Suppliers", url: "/suppliers", icon: "factory" },
  { title: "Materials", url: "/materials", icon: "eco" },
]

const agentNav = [
  { title: "Dashboard", url: "/dashboard", icon: "dashboard" },
  { title: "My Inventory", url: "/inventory", icon: "inventory" },
  { title: "Sales", url: "/sales", icon: "point_of_sale" },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authRepository.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    logout()
    localStorage.removeItem("auth-storage")
    await new Promise(resolve => setTimeout(resolve, 200))
    window.location.href = "/login"
  }

  if (isLoggingOut) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Logging out...</p>
        </div>
      </div>
    )
  }

  const truncatedAddress = user?.address 
    ? `${user.address.slice(0, 12)}...${user.address.slice(-4)}` 
    : "Connect wallet"
  
  const displayName = user?.name || truncatedAddress

  const navItems = user?.role === "AGENT" ? agentNav : manufacturerNav

  const handleCopyAddress = () => {
    if (user?.address) {
      navigator.clipboard.writeText(user.address)
      toast.success("Address copied!")
    }
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/dashboard">
                <Image src="/logo.svg" alt="Logo" width={24} height={24} />
                <span className="text-base font-semibold">HSupply</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Menu</span>
            {user?.role && (
              <Badge variant={user.role === "MANUFACTURER" ? "default" : "secondary"} className="text-[10px]">
                {user.role === "MANUFACTURER" ? "Manufacturer" : "Agent"}
              </Badge>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url || pathname.startsWith(`${item.url}/`)} tooltip={item.title}>
                    <Link href={item.url}>
                      <Icon name={item.icon} size="sm" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              className={user?.address ? "cursor-pointer" : "cursor-default hover:bg-transparent"}
              onClick={handleCopyAddress}
              tooltip={user?.address ? "Click to copy address" : undefined}
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src="/avatars/user.jpg" alt={displayName} />
                <AvatarFallback className="rounded-lg">
                  <Icon name="account_balance_wallet" size="sm" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">{truncatedAddress}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Log out">
              <Icon name="logout" size="sm" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
