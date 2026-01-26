"use client"

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { Supplier } from '@/types/api'
import { LoadingPage } from '@/components/ui/loading'
import { PageHeader } from '@/components/dashboard/shared/page-header'
import { SupplierList } from '@/components/dashboard/suppliers/supplier-list'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  const loadSuppliers = async () => {
    try {
      const data = await apiClient.suppliers.findAll()
      setSuppliers(Array.isArray(data) ? data : [])
    } catch {
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSuppliers()
  }, [])

  if (loading) {
    return <LoadingPage />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Suppliers"
        description="Manage your suppliers"
      />
      <SupplierList suppliers={suppliers} onRefresh={loadSuppliers} />
    </div>
  )
}
