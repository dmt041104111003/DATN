"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api/client'
import { LoadingOverlay } from '@/components/ui/loading'

export default function DashboardPage() {
  const [productsCount, setProductsCount] = useState(0)
  const [collectionsCount, setCollectionsCount] = useState(0)
  const [suppliersCount, setSuppliersCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [products, collections, suppliers] = await Promise.all([
          apiClient.products.findMy().catch(() => []),
          apiClient.collections.findMy().catch(() => []),
          apiClient.suppliers.findAll().catch(() => [])
        ])
        setProductsCount(Array.isArray(products) ? products.length : 0)
        setCollectionsCount(Array.isArray(collections) ? collections.length : 0)
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
        <h1 className="text-2xl sm:text-3xl font-bold">Welcome</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Welcome to your traceability dashboard</p>
      </div>

      <div className="w-full h-[calc(100vh-12rem)] flex gap-4 sm:gap-6">
        <div className="w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{productsCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{collectionsCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{suppliersCount}</p>
            </CardContent>
          </Card>
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
