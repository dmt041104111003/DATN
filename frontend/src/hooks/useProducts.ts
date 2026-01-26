import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { productsApi } from '@/lib/api/products'
import { productMaterialsApi } from '@/lib/api/product-materials'
import { certificationsApi } from '@/lib/api/certifications'
import { mediaApi } from '@/lib/api/media'
import { materialsApi } from '@/lib/api/materials'
import { contractApi } from '@/lib/api/contract'
import { Product, ProductFormData, ProductMaterialItem, ProductCertificationItem, ProductMediaItem } from '@/types/product'
import { Material } from '@/types/material'
import { Certification } from '@/types/certification'
import { handleApiError } from '@/lib/utils/error-handler'
import { showAlert } from '@/lib/utils/alert'
import { confirm } from '@/lib/utils/confirm'
import { useWallet } from '@/hooks/use-wallet'
import { useAuth } from '@/contexts/auth-context'

export function useProducts() {
  const router = useRouter()
  const { user } = useAuth()
  const { connectWallet } = useWallet()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [materials, setMaterials] = useState<ProductMaterialItem[]>([])
  const [certifications, setCertifications] = useState<ProductCertificationItem[]>([])
  const [media, setMedia] = useState<ProductMediaItem[]>([])
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([])
  const [availableCertifications, setAvailableCertifications] = useState<Certification[]>([])
  const [availableMedia, setAvailableMedia] = useState<ProductMediaItem[]>([])
  const [hashRoots, setHashRoots] = useState<{ materialsRoot: string; certificationsRoot: string; mediaRoot: string } | undefined>()
  const form = useForm<ProductFormData>()

  const loadData = async () => {
    try {
      setError(null)
      const data = await productsApi.findMy()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableMaterials = async () => {
    try {
      const data = await materialsApi.findAll()
      setAvailableMaterials(Array.isArray(data) ? data : [])
    } catch {
      setAvailableMaterials([])
    }
  }

  const loadAvailableCertifications = async () => {
    try {
      const data = await certificationsApi.findAll()
      setAvailableCertifications(Array.isArray(data) ? data : [])
    } catch {
      setAvailableCertifications([])
    }
  }

  const loadAvailableMedia = async () => {
    try {
      const data = await mediaApi.findAll()
      setAvailableMedia(data.map((m: any) => ({
        id: m.id,
        name: m.name,
        type: m.type,
        url: m.url,
        gatewayUrl: m.gatewayUrl,
      })))
    } catch {
      setAvailableMedia([])
    }
  }

  useEffect(() => {
    loadData()
    loadAvailableMaterials()
    loadAvailableCertifications()
    loadAvailableMedia()
  }, [])

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
      })
      loadProductData(editing.id)
    } else {
      setMaterials([])
      setCertifications([])
      setMedia([])
      setHashRoots(undefined)
    }
  }, [editing, form])

  const loadProductData = async (productId: string) => {
    try {
      const [pmData, certData] = await Promise.all([
        productMaterialsApi.findByProduct(productId),
        certificationsApi.findAll(),
      ])
      
      const productCerts = certData.filter((c: any) => c.productId === productId)
      
      setMaterials(pmData.map((pm: any) => ({
        materialId: pm.materialId,
        quantity: pm.quantity,
        unit: pm.unit,
        material: pm.material ? {
          id: pm.material.id,
          name: pm.material.name,
          supplier: pm.material.supplier ? { name: pm.material.supplier.name } : undefined,
        } : undefined,
      })))
      
      setCertifications(productCerts.map((c: any) => ({
        certName: c.certName,
        issueDate: c.issueDate,
        expiryDate: c.expiryDate,
      })))
      
      const mediaData = await mediaApi.findAll()
      setMedia(mediaData.map((m: any) => ({
        id: m.id,
        name: m.name,
        type: m.type,
        url: m.url,
        gatewayUrl: m.gatewayUrl,
      })))
    } catch {
    }
  }

  const handleCreate = () => {
    setEditing(null)
    setMaterials([])
    setCertifications([])
    setMedia([])
    setHashRoots(undefined)
    form.reset()
    setOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditing(product)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditing(null)
    setMaterials([])
    setCertifications([])
    setMedia([])
    setHashRoots(undefined)
    form.reset()
  }

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true)
    try {
      let product: Product
      if (editing) {
        product = await productsApi.update(editing.id, data)
        
        const [existingPmData, existingCertData] = await Promise.all([
          productMaterialsApi.findByProduct(product.id),
          certificationsApi.findAll(),
        ])
        const existingCerts = existingCertData.filter((c: any) => c.productId === product.id)
        
        await Promise.all([
          ...existingPmData.map((pm: any) => productMaterialsApi.remove(pm.id)),
          ...existingCerts.map((c: any) => certificationsApi.remove(c.id)),
        ])
      } else {
        product = await productsApi.create(data)
      }

      await Promise.all([
        ...materials.map(pm =>
          productMaterialsApi.create({
            productId: product.id,
            materialId: pm.materialId,
            quantity: 1,
          })
        ),
        ...certifications.map(cert =>
          certificationsApi.create({
            productId: product.id,
            certName: cert.certName,
            issueDate: cert.issueDate,
            expiryDate: cert.expiryDate,
          })
        ),
      ])

      handleClose()
      await loadData()
    } catch (err) {
      const errorMessage = handleApiError(err, router)
      if (!errorMessage.includes('expired') && !errorMessage.includes('Subscription')) {
        showAlert({ description: errorMessage, variant: 'error' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleMint = async () => {
    if (!editing || !user) return
    
    try {
      const metadata = await contractApi.prepareMetadata(editing.id)
      const wallet = await connectWallet('nami', 'preprod')
      
      await contractApi.mint(user.address, [{
        assetName: editing.assetName || '',
        metadata: metadata as Record<string, string>,
        quantity: '1',
      }])
      
      showAlert({ description: 'Product minted successfully', variant: 'success' })
      await loadData()
    } catch (err) {
      const errorMessage = handleApiError(err, router)
      showAlert({ description: errorMessage, variant: 'error' })
    }
  }

  const handleDelete = async (id: string, product?: Product) => {
    const isMinted = product?.policyId && product?.assetName && product.policyId !== '' && product.assetName !== ''
    const message = isMinted
      ? 'Are you sure you want to delete this product?\n\nWARNING: This product has been minted as NFT.\n\nOn-chain blockchain data cannot be deleted, but off-chain metadata will be removed from the system.\n\nThis action cannot be undone.'
      : 'Are you sure you want to delete this product?\n\nThis action cannot be undone.'

    if (!(await confirm(message))) return

    try {
      const result = await productsApi.remove(id)
      if (result?.wasMinted) {
        showAlert({ description: `Product deleted successfully.\n\nNote: This product was minted as NFT. On-chain blockchain data cannot be deleted, but off-chain metadata has been removed.`, variant: 'success' })
      } else {
        showAlert({ description: 'Product deleted successfully.', variant: 'success' })
      }
      await loadData()
    } catch (err) {
      const errorMessage = handleApiError(err, router)
      showAlert({ description: errorMessage, variant: 'error' })
    }
  }

  return {
    items: products,
    loading,
    error,
    open,
    submitting,
    editing,
    form,
    materials,
    certifications,
    media,
    availableMaterials,
    availableCertifications,
    availableMedia,
    hashRoots,
    setMaterials,
    setCertifications,
    setMedia,
    setHashRoots,
    setOpen,
    handleCreate,
    handleEdit,
    handleDelete,
    handleClose,
    handleMint,
    onSubmit,
  }
}
