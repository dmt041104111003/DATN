"use client"

import { 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { Icon } from "@/components/ui/icon"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { title: "Products", href: "/dashboard/products", icon: "inventory" },
  { title: "Materials", href: "/dashboard/materials", icon: "category" },
  { title: "Collections", href: "/dashboard/collections", icon: "collections" },
  { title: "Warehouses", href: "/dashboard/warehouses", icon: "warehouse" },
  { title: "Settings", href: "/dashboard/settings", icon: "settings" },
]

export function DashboardSidebar() {
  const { logout } = useAuth()
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <SidebarContent>
      <SidebarHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Logo" width={24} height={24} />
            <span className="text-lg font-bold">HSupply</span>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarGroup>
        <SidebarGroupLabel className="text-xs uppercase text-muted-foreground font-medium">
          Navigation
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive(item.href)}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive(item.href) && "bg-accent font-semibold"
                  )}
                >
                  <Link href={item.href}>
                    <Icon 
                      name={item.icon} 
                      size="sm" 
                      className={cn(
                        isActive(item.href) ? "text-foreground" : "text-muted-foreground"
                      )}
                    />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarFooter className="border-t pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} className="w-full justify-start gap-3">
              <Icon name="logout" size="sm" className="text-muted-foreground" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarContent>
  )
}
