"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Warehouse, WarehouseStorage } from '@/types/api'
import { WarehouseStorages } from '@/components/dashboard/warehouse-storages'

export default function WarehouseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null)
  const [storages, setStorages] = useState<WarehouseStorage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadWarehouse(params.id as string)
    }
  }, [params.id])

  const loadWarehouse = async (id: string, skipLoading = false) => {
    if (!skipLoading) {
      setLoading(true)
    }
    try {
      const [warehouseData, storagesData] = await Promise.all([
        apiClient.warehouses.findOne(id),
        apiClient.warehouseStorages.findAll().catch(() => []),
      ])
      setWarehouse(warehouseData)
      setStorages(Array.isArray(storagesData) ? storagesData.filter(s => s.warehouseId === id) : [])
    } catch {
      setWarehouse(null)
    } finally {
      if (!skipLoading) {
        setLoading(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="h-8 bg-muted animate-pulse rounded w-48" />
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!warehouse) {
    return (
      <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Warehouse not found</p>
              <Button className="mt-4" onClick={() => router.push('/dashboard/warehouses')}>
                Back to Warehouses
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
        <div>
          <Button variant="ghost" onClick={() => router.push('/dashboard/warehouses')} className="mb-2">
            ← Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold mt-2 break-words">{warehouse.name}</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Warehouse details</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="mt-1">{warehouse.name}</p>
              </div>
              {warehouse.location && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <p className="mt-1">{warehouse.location}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Capacity</label>
                <p className="mt-1">{warehouse.capacity}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="mt-1">{new Date(warehouse.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                <p className="mt-1">{new Date(warehouse.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

      <WarehouseStorages warehouseId={warehouse.id} storages={storages} onRefresh={() => loadWarehouse(warehouse.id, true)} />
    </div>
  )
}
