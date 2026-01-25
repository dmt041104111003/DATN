"use client"

import { SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { Icon } from "@/components/ui/icon"
import Link from "next/link"
import { usePathname } from "next/navigation"

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

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href}>
                    <Icon name={item.icon} size="sm" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout}>
                <Icon name="logout" size="sm" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}
