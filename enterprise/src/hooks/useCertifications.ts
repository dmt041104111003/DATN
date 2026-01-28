import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { certificationsApi } from '@/lib/api/certifications'
import { Certification, CertificationFormData } from '@/types/certification'
import { productsApi } from '@/lib/api/products'
import { Product } from '@/types/product'
import { handleApiError } from '@/lib/utils/error-handler'
import { showAlert } from '@/lib/utils/alert'
import { confirm } from '@/lib/utils/confirm'
import { formatDateOnlyForInput } from '@/lib/utils/crud-helpers'

export function useCertifications() {
  const router = useRouter()
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Certification | null>(null)
  const form = useForm<CertificationFormData>()

  const loadData = async () => {
    try {
      const [data, productData] = await Promise.all([
        certificationsApi.findAll(),
        productsApi.findMy(),
      ])
      setCertifications(Array.isArray(data) ? data : [])
      setProducts(Array.isArray(productData) ? productData : [])
    } catch {
      setCertifications([])
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
        productId: editing.productId || '',
        certName: editing.certName,
        issueDate: formatDateOnlyForInput(editing.issueDate),
        expiryDate: formatDateOnlyForInput(editing.expiryDate),
        certHash: editing.certHash || '',
      })
    }
  }, [editing, form])

  const handleCreate = () => {
    setEditing(null)
    form.reset({ productId: '', certName: '', issueDate: '', expiryDate: '', certHash: '' })
    setOpen(true)
  }

  const handleEdit = (certification: Certification) => {
    setEditing(certification)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditing(null)
    form.reset()
  }

  const onSubmit = async (data: CertificationFormData) => {
    setSubmitting(true)
    try {
      if (!data.productId) {
        form.setError('productId', { message: 'Product is required' })
        return
      }
      if (editing) {
        await certificationsApi.update(editing.id, data)
      } else {
        await certificationsApi.create(data)
      }
      handleClose()
      await loadData()
    } catch (err) {
      const errorMessage = handleApiError(err, router)
      showAlert({ description: errorMessage, variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!(await confirm('Are you sure you want to delete this certification?'))) return
    try {
      await certificationsApi.remove(id)
      await loadData()
    } catch (err) {
      const errorMessage = handleApiError(err, router)
      showAlert({ description: errorMessage, variant: 'error' })
    }
  }

  return {
    items: certifications,
    products,
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
