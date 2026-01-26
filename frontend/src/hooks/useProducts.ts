import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { productsApi } from '@/lib/api/products'
import { Product, ProductFormData } from '@/types/product'
import { handleApiError } from '@/lib/utils/error-handler'
import { showAlert } from '@/lib/utils/alert'
import { confirm } from '@/lib/utils/confirm'

export function useProducts() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const form = useForm<ProductFormData>()

  const loadData = async () => {
    try {
      const data = await productsApi.findMy()
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
      })
    }
  }, [editing, form])

  const handleCreate = () => {
    setEditing(null)
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
    form.reset()
  }

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true)
    try {
      if (editing) {
        await productsApi.update(editing.id, data)
      } else {
        await productsApi.create(data)
      }
      handleClose()
      await loadData()
    } catch (err) {
      const errorMessage = handleApiError(err, router)
      if (errorMessage.includes('expired') || errorMessage.includes('Subscription')) {
        showAlert({ description: `${errorMessage}. Please renew your subscription to continue.`, variant: 'warning' })
        router.push('/dashboard/billing/services')
      } else {
        showAlert({ description: errorMessage, variant: 'error' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, product?: Product) => {
    const isMinted = product?.policyId && product?.assetName
    const message = isMinted
      ? 'Are you sure you want to delete this product?\n\n⚠️ WARNING: This product has been minted as NFT.\n\nOn-chain blockchain data cannot be deleted, but off-chain metadata will be removed from the system.\n\nThis action cannot be undone.'
      : 'Are you sure you want to delete this product?\n\nThis action cannot be undone.'

    if (!(await confirm(message))) return

    try {
      const result = await productsApi.remove(id)
      if (result?.wasMinted) {
        showAlert({ description: `Product deleted successfully.\n\n⚠️ Note: This product was minted as NFT. On-chain blockchain data cannot be deleted, but off-chain metadata has been removed.`, variant: 'success' })
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
    open,
    submitting,
    editing,
    form,
    setOpen,
    handleCreate,
    handleEdit,
    handleDelete,
    handleClose,
    onSubmit,
  }
}
