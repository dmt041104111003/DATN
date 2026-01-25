"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Warehouse, WarehouseStorage } from '@/types/api'
import { WarehouseStorages } from '@/components/dashboard/warehouse-storages'
import { LoadingPage } from '@/components/ui/loading'
import { DetailPageHeader } from '@/components/dashboard/detail-page-header'
import { InfoCard } from '@/components/dashboard/info-card'
import { NotFoundState } from '@/components/dashboard/not-found-state'

export default function WarehouseDetailPage() {
  const params = useParams()
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
    return <LoadingPage />
  }

  if (!warehouse) {
    return (
      <NotFoundState
        message="Warehouse not found"
        backHref="/dashboard/warehouses"
        backLabel="Back to Warehouses"
      />
    )
  }

  const basicInfoItems = [
    { label: 'Name', value: warehouse.name },
    ...(warehouse.location ? [{ label: 'Location', value: warehouse.location }] : []),
    { label: 'Capacity', value: warehouse.capacity },
  ]

  const timestampItems = [
    { label: 'Created At', value: new Date(warehouse.createdAt).toLocaleString() },
    { label: 'Updated At', value: new Date(warehouse.updatedAt).toLocaleString() },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <DetailPageHeader
        title={warehouse.name}
        description="Warehouse details"
        backHref="/dashboard/warehouses"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Basic Information" items={basicInfoItems} />
        <InfoCard title="Timestamps" items={timestampItems} />
      </div>

      <WarehouseStorages warehouseId={warehouse.id} storages={storages} onRefresh={() => loadWarehouse(warehouse.id, true)} />
    </div>
  )
}
