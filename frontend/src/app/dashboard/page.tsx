"use client"

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome to your dashboard</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
