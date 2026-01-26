"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { Material, ProductMaterial, Product } from '@/types/api'
import { LoadingPage } from '@/components/ui/loading'
import { DetailPageHeader } from '@/components/dashboard/shared/detail-page-header'
import { InfoCard } from '@/components/dashboard/shared/info-card'
import { NotFoundState } from '@/components/dashboard/shared/not-found-state'
import { ResponsiveListView } from '@/components/dashboard/shared/responsive-list-view'
import { EmptyState } from '@/components/dashboard/shared/empty-state'

export default function MaterialDetailPage() {
  const params = useParams()
  const [material, setMaterial] = useState<Material | null>(null)
  const [productMaterials, setProductMaterials] = useState<ProductMaterial[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadMaterial(params.id as string)
    }
  }, [params.id])

  const loadMaterial = async (id: string, skipLoading = false) => {
    if (!skipLoading) {
      setLoading(true)
    }
    try {
      const materialData = await apiClient.materials.findOne(id)
      setMaterial(materialData)
      
      // Load products and their materials
      try {
        const productsData = await apiClient.products.findMy()
        const productsWithMaterials = await Promise.all(
          productsData.map(async (product) => {
            try {
              const pms = await apiClient.productMaterials.findByProduct(product.id)
              const pm = pms.find(p => p.materialId === id)
              return pm ? { product, pm } : null
            } catch {
              return null
            }
          })
        )
        const validItems = productsWithMaterials.filter((item): item is { product: Product; pm: ProductMaterial } => item !== null)
        setProducts(validItems.map(item => item.product))
        setProductMaterials(validItems.map(item => item.pm))
      } catch {
        setProducts([])
        setProductMaterials([])
      }
    } catch {
      setMaterial(null)
    } finally {
      if (!skipLoading) {
        setLoading(false)
      }
    }
  }

  if (loading) {
    return <LoadingPage />
  }

  if (!material) {
    return (
      <NotFoundState
        message="Material not found"
        backHref="/dashboard/materials"
        backLabel="Back to Materials"
      />
    )
  }

  const basicInfoItems = [
    { label: 'Name', value: material.name },
    { label: 'Supplier', value: material.supplier?.name || 'No supplier' },
    ...(material.quantity ? [{ label: 'Quantity', value: material.quantity.toString() }] : []),
    ...(material.harvestDate ? [{ label: 'Harvest Date', value: new Date(material.harvestDate).toLocaleDateString() }] : []),
  ]

  const timestampItems = [
    { label: 'Created At', value: new Date(material.createdAt).toLocaleString() },
    { label: 'Updated At', value: new Date(material.updatedAt).toLocaleString() },
  ]

  const getProductMaterialInfo = (productId: string) => {
    return productMaterials.find(pm => pm.productId === productId)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <DetailPageHeader
        title={material.name}
        description="Material details"
        backHref="/dashboard/materials"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Basic Information" items={basicInfoItems} />
        <InfoCard title="Timestamps" items={timestampItems} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Used in Products</h2>
        {products.length === 0 ? (
          <EmptyState message="This material is not used in any products yet" />
        ) : (
          <ResponsiveListView
            items={products}
            columns={[
              { key: 'name', header: 'Product Name', render: (p) => <span className="font-medium">{p.name}</span> },
              { key: 'quantity', header: 'Quantity Used', render: (p) => {
                const pm = getProductMaterialInfo(p.id)
                return pm?.quantity || '-'
              }},
              { key: 'unit', header: 'Unit', render: (p) => {
                const pm = getProductMaterialInfo(p.id)
                return pm?.unit || '-'
              }},
            ]}
            actions={(product) => ({
              viewHref: `/dashboard/products/${product.id}`,
            })}
            mobileCardTitle={(p) => p.name}
            mobileCardDescription={(p) => {
              const pm = getProductMaterialInfo(p.id)
              return pm ? `Quantity: ${pm.quantity} ${pm.unit || ''}` : undefined
            }}
          />
        )}
      </div>
    </div>
  )
}
