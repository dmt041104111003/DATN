"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { apiClient } from '@/lib/api/client'
import { LoadingOverlay } from '@/components/ui/loading'
import { PageHeader } from '@/components/dashboard/shared/page-header'
import { StatsCard } from '@/components/dashboard/shared/stats-card'
export default function DashboardPage() {
  const [productsCount, setProductsCount] = useState(0)
  const [suppliersCount, setSuppliersCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [products, suppliers] = await Promise.all([
          apiClient.products.findMy().catch(() => []),
          apiClient.suppliers.findAll().catch(() => [])
        ])
        setProductsCount(Array.isArray(products) ? products.length : 0)
        setSuppliersCount(Array.isArray(suppliers) ? suppliers.length : 0)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="space-y-4 sm:space-y-6 relative">
      <PageHeader
        title="Welcome"
        description="Welcome to your traceability dashboard"
      />

      <div className="w-full h-[calc(100vh-12rem)] flex gap-4 sm:gap-6">
        <div className="w-80 space-y-4">
          <StatsCard title="Total Products" value={productsCount} />
          <StatsCard title="Total Suppliers" value={suppliersCount} />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <Image
            src="/dashboard.gif"
            alt="Dashboard"
            width={1200}
            height={800}
            className="w-full h-full object-contain"
            unoptimized
          />
        </div>
      </div>

      {loading && <LoadingOverlay />}
    </div>
  )
}
