"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { productsApi } from '@/lib/api/products'
import { supplierApi } from '@/lib/api/supplier'
import { LoadingOverlay } from '@/components/ui/loading'
export default function DashboardPage() {
  const [productsCount, setProductsCount] = useState(0)
  const [suppliersCount, setSuppliersCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [products, suppliers] = await Promise.all([
          productsApi.findMy().catch(() => []),
          supplierApi.findAll().catch(() => [])
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
      <div>
        <h1 className="text-2xl font-bold">Welcome</h1>
        <p className="text-muted-foreground">Welcome to your traceability dashboard</p>
      </div>

      <div className="w-full h-[calc(100vh-12rem)] flex gap-4 sm:gap-6">
        <div className="w-80 space-y-4">
          <div className="border rounded p-4">
            <div className="text-sm text-muted-foreground">Total Products</div>
            <div className="text-2xl font-bold">{productsCount}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-muted-foreground">Total Suppliers</div>
            <div className="text-2xl font-bold">{suppliersCount}</div>
          </div>
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
