"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { ProductionProcess } from '@/types/api'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { SubListCard } from './sub-list-card'
import { handleApiError } from '@/lib/utils/error-handler'

export function ProductProcesses({ productId, processes, onRefresh }: { productId: string; processes: ProductionProcess[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewingProcess, setViewingProcess] = useState<ProductionProcess | null>(null)
  const [editing, setEditing] = useState<ProductionProcess | null>(null)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<{ stepName: string; startTime: string; endTime?: string; location?: string }>()

  const onSubmit = async (data: { stepName: string; startTime: string; endTime?: string; location?: string }) => {
    setLoading(true)
    try {
      if (editing) {
        await apiClient.productionProcesses.update(editing.id, data)
      } else {
        await apiClient.productionProcesses.create({ ...data, productId })
      }
      setOpen(false)
      setEditing(null)
      reset()
      onRefresh()
    } catch (err) {
      const errorMessage = handleApiError(err)
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (process: ProductionProcess) => {
    setEditing(process)
    setValue('stepName', process.stepName)
    const startTime = new Date(process.startTime)
    setValue('startTime', startTime.toISOString().slice(0, 16))
    if (process.endTime) {
      const endTime = new Date(process.endTime)
      setValue('endTime', endTime.toISOString().slice(0, 16))
    } else {
      setValue('endTime', '')
    }
    setValue('location', process.location || '')
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this process?')) return
    try {
      await apiClient.productionProcesses.remove(id)
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const handleCreate = () => {
    setEditing(null)
    reset()
    setOpen(true)
  }

  const handleView = (process: ProductionProcess) => {
    setViewingProcess(process)
    setViewOpen(true)
  }

  const startTime = watch('startTime')
  const endTime = watch('endTime')

  return (
    <SubListCard
      title="Production Processes"
      items={processes}
      columns={[
        { key: 'stepName', header: 'Step Name', render: (p) => <span className="font-medium">{p.stepName}</span> },
        { key: 'startTime', header: 'Start Time', render: (p) => new Date(p.startTime).toLocaleString() },
        { key: 'endTime', header: 'End Time', render: (p) => p.endTime ? new Date(p.endTime).toLocaleString() : '-' },
        { key: 'location', header: 'Location', render: (p) => p.location || '-' },
      ]}
      actions={(process) => ({
        onView: () => handleView(process),
        onEdit: () => handleEdit(process),
        onDelete: () => handleDelete(process.id),
      })}
      mobileCardTitle={(p) => p.stepName}
      mobileCardDescription={(p) => (
        <span className="text-xs text-muted-foreground break-words">
          {new Date(p.startTime).toLocaleString()}
          {p.endTime && ` - ${new Date(p.endTime).toLocaleString()}`}
          {p.location && ` | ${p.location}`}
        </span>
      )}
      emptyMessage="No processes"
      dialogOpen={open}
      onDialogOpenChange={(open) => {
        setOpen(open)
        if (!open) {
          setEditing(null)
          reset()
        }
      }}
      dialogTrigger={<Button size="sm" className="w-full sm:w-auto">Add</Button>}
      submitting={loading}
      dialogContent={
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Process Step' : 'Add Process Step'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update production process information' : 'Add a new production process step'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-4 py-4 min-w-0 w-full">
            <div className="grid gap-2">
              <Label>Step Name *</Label>
              <Input 
                {...register('stepName', { required: 'Please enter step name' })} 
                placeholder="e.g. Harvesting, Processing, Packaging" 
                disabled={loading}
              />
              {errors.stepName && (
                <p className="text-sm text-destructive">{errors.stepName.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Start Time *</Label>
              <Input 
                type="datetime-local" 
                {...register('startTime', { required: 'Vui lòng chọn thời gian bắt đầu' })} 
                disabled={loading}
              />
              {errors.startTime && (
                <p className="text-sm text-destructive">{errors.startTime.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>End Time (Optional)</Label>
              <Input 
                type="datetime-local" 
                {...register('endTime', {
                  validate: (value) => {
                    if (!value) return true
                    if (!startTime) return true
                    if (new Date(value) <= new Date(startTime)) {
                      return 'End time must be after start time'
                    }
                    return true
                  }
                })} 
                disabled={loading}
              />
              {errors.endTime && (
                <p className="text-sm text-destructive">{errors.endTime.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Location (Optional)</Label>
              <Input {...register('location')} placeholder="e.g. Factory A, Warehouse B" disabled={loading} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setOpen(false)
              setEditing(null)
              reset()
            }} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Processing...' : editing ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </form>
      }
    />
  )
}
