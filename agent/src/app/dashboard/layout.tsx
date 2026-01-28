"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full">
      <DashboardSidebar />
      <main className="flex-1 lg:ml-72 p-3 sm:p-4 md:p-6">
        {children}
      </main>
    </div>
  )
}
