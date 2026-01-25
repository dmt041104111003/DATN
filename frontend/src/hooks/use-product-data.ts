import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'
import { Product, Document, Certification, ProductionProcess, ProductMaterial, WarehouseStorage } from '@/types/api'

export function useProductData(productId: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [processes, setProcesses] = useState<ProductionProcess[]>([])
  const [productMaterials, setProductMaterials] = useState<ProductMaterial[]>([])
  const [warehouseStorages, setWarehouseStorages] = useState<WarehouseStorage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (productId) {
      loadProduct(productId)
    }
  }, [productId])

  const loadProduct = async (id: string, skipLoading = false) => {
    if (!skipLoading) {
      setLoading(true)
    }
    try {
      const [productData, docsData, certsData, processesData, materialsData, storagesData] = await Promise.all([
        apiClient.products.findOne(id),
        apiClient.documents.findAll().catch(() => []),
        apiClient.certifications.findAll().catch(() => []),
        apiClient.productionProcesses.findAll().catch(() => []),
        apiClient.productMaterials.findByProduct(id).catch(() => []),
        apiClient.warehouseStorages.findAll().catch(() => []),
      ])
      setProduct(productData)
      setDocuments(Array.isArray(docsData) ? docsData.filter(d => d.productId === id) : [])
      setCertifications(Array.isArray(certsData) ? certsData.filter(c => c.productId === id) : [])
      setProcesses(Array.isArray(processesData) ? processesData.filter(p => p.productId === id) : [])
      setProductMaterials(Array.isArray(materialsData) ? materialsData : [])
      setWarehouseStorages(Array.isArray(storagesData) ? storagesData.filter(s => s.productId === id) : [])
    } catch {
      setProduct(null)
    } finally {
      if (!skipLoading) {
        setLoading(false)
      }
    }
  }

  return {
    product,
    documents,
    certifications,
    processes,
    productMaterials,
    warehouseStorages,
    loading,
    loadProduct,
  }
}
