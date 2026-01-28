import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { supplierApi } from '@/lib/api/supplier'
import { Supplier, SupplierFormData } from '@/types/supplier'
import { handleApiError } from '@/lib/utils/error-handler'
import { showAlert } from '@/lib/utils/alert'
import { confirm } from '@/lib/utils/confirm'

export function useSupplier() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [location, setLocation] = useState<{ location: string; gpsCoordinates: string } | undefined>()
  const form = useForm<SupplierFormData>()

  const loadData = async () => {
    try {
      const data = await supplierApi.findAll()
      setSuppliers(Array.isArray(data) ? data : [])
    } catch {
      setSuppliers([])
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
        contactInfo: editing.contactInfo || '',
      })
      setLocation({
        location: editing.location || '',
        gpsCoordinates: editing.gpsCoordinates || '',
      })
    }
  }, [editing, form])

  const handleCreate = () => {
    setEditing(null)
    setLocation(undefined)
    form.reset()
    setOpen(true)
  }

  const handleEdit = (supplier: Supplier) => {
    setEditing(supplier)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditing(null)
    setLocation(undefined)
    form.reset()
  }

  const onSubmit = async (data: SupplierFormData) => {
    setSubmitting(true)
    try {
      const payload = {
        name: data.name,
        contactInfo: data.contactInfo,
        location: location?.location,
        gpsCoordinates: location?.gpsCoordinates,
      }
      if (editing) {
        await supplierApi.update(editing.id, payload)
      } else {
        await supplierApi.create(payload)
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
    if (!(await confirm('Are you sure you want to delete this supplier?'))) return
    try {
      await supplierApi.remove(id)
      await loadData()
    } catch (err) {
      const errorMessage = handleApiError(err, router)
      showAlert({ description: errorMessage, variant: 'error' })
    }
  }

  return {
    items: suppliers,
    loading,
    open,
    submitting,
    editing,
    form,
    location,
    setLocation,
    setOpen,
    handleCreate,
    handleEdit,
    handleDelete,
    handleClose,
    onSubmit,
  }
}
