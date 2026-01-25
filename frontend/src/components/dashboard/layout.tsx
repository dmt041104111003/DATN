"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Sidebar } from "@/components/ui/sidebar"
import { DashboardSidebar } from "./sidebar"
import { useAuth } from "@/contexts/auth-context"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  if (!user) return null

  return (
    <SidebarProvider>
      <Sidebar>
        <DashboardSidebar />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
