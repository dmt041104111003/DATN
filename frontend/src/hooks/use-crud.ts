import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { handleApiError } from '@/lib/utils/error-handler'

interface UseCrudOptions<T, TFormData> {
  loadData: () => Promise<void>
  onCreate?: (data: TFormData) => Promise<void>
  onUpdate?: (id: string, data: TFormData) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  getDeleteConfirmMessage?: (item: T) => string
  getDeleteSuccessMessage?: (item: T) => string
  redirectOnSubscriptionError?: boolean
}

export function useCrud<T extends { id: string }, TFormData extends Record<string, any>>(
  options: UseCrudOptions<T, TFormData>
) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const form = useForm<TFormData>()

  const handleCreate = () => {
    setEditing(null)
    form.reset()
    setOpen(true)
  }

  const handleEdit = (item: T) => {
    setEditing(item)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditing(null)
    form.reset()
  }

  const onSubmit = async (data: TFormData) => {
    setSubmitting(true)
    try {
      if (editing && options.onUpdate) {
        await options.onUpdate(editing.id, data)
      } else if (options.onCreate) {
        await options.onCreate(data)
      }
      handleClose()
      await options.loadData()
    } catch (err) {
      const errorMessage = handleApiError(err, options.redirectOnSubscriptionError ? router : undefined)
      alert(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, item?: T) => {
    const confirmMessage = item && options.getDeleteConfirmMessage
      ? options.getDeleteConfirmMessage(item)
      : 'Are you sure you want to delete this item?'
    
    if (!confirm(confirmMessage)) return

    try {
      if (options.onDelete) {
        await options.onDelete(id)
      } else {
        await options.loadData()
        if (item && options.getDeleteSuccessMessage) {
          alert(options.getDeleteSuccessMessage(item))
        } else {
          alert('Item deleted successfully.')
        }
      }
      await options.loadData()
    } catch (err) {
      const errorMessage = handleApiError(err, options.redirectOnSubscriptionError ? router : undefined)
      alert(errorMessage)
    }
  }

  return {
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
