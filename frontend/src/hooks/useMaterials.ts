import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { materialsApi } from '@/lib/api/materials'
import { supplierApi } from '@/lib/api/supplier'
import { Material, MaterialFormData } from '@/types/material'
import { Supplier } from '@/types/supplier'
import { handleApiError } from '@/lib/utils/error-handler'
import { showAlert } from '@/lib/utils/alert'
import { confirm } from '@/lib/utils/confirm'
import { formatDateOnlyForInput } from '@/lib/utils/crud-helpers'

export function useMaterials() {
  const router = useRouter()
  const [materials, setMaterials] = useState<Material[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Material | null>(null)
  const form = useForm<MaterialFormData>()

  const loadData = async () => {
    try {
      const data = await materialsApi.findAll()
      setMaterials(Array.isArray(data) ? data : [])
    } catch {
      setMaterials([])
    } finally {
      setLoading(false)
    }
  }

  const loadSuppliers = async () => {
    try {
      const data = await supplierApi.findAll()
      setSuppliers(Array.isArray(data) ? data : [])
    } catch {
      setSuppliers([])
    }
  }

  useEffect(() => {
    loadData()
    loadSuppliers()
  }, [])

  useEffect(() => {
    if (editing) {
      form.reset({
        supplierId: editing.supplierId,
        name: editing.name,
        harvestDate: formatDateOnlyForInput(editing.harvestDate),
        quantity: editing.quantity,
      })
    }
  }, [editing, form])

  const handleCreate = () => {
    setEditing(null)
    form.reset()
    setOpen(true)
  }

  const handleEdit = (material: Material) => {
    setEditing(material)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditing(null)
    form.reset()
  }

  const onSubmit = async (data: MaterialFormData) => {
    setSubmitting(true)
    try {
      if (!data.supplierId) {
        throw new Error('Please select a supplier')
      }
      if (editing) {
        await materialsApi.update(editing.id, data)
      } else {
        await materialsApi.create(data)
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
    if (!(await confirm('Are you sure you want to delete this material?'))) return
    try {
      await materialsApi.remove(id)
      await loadData()
    } catch (err) {
      const errorMessage = handleApiError(err, router)
      showAlert({ description: errorMessage, variant: 'error' })
    }
  }

  return {
    items: materials,
    suppliers,
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
