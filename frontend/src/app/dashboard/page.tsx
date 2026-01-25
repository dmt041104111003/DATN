"use client"

import { DashboardLayout } from '@/components/dashboard/layout'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome to your dashboard</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
