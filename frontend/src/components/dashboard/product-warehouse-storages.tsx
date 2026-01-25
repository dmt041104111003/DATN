"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { WarehouseStorage, Warehouse } from '@/types/api'
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { SubListCard } from './sub-list-card'
import { handleApiError } from '@/lib/utils/error-handler'

export function ProductWarehouseStorages({ productId, storages, onRefresh }: { productId: string; storages: WarehouseStorage[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<WarehouseStorage | null>(null)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, setValue, watch } = useForm<{ warehouseId: string; entryTime: string; exitTime?: string; conditions?: string }>()

  useEffect(() => {
    if (open) {
      loadWarehouses()
    }
  }, [open])

  const loadWarehouses = async () => {
    try {
      const data = await apiClient.warehouses.findAll()
      setWarehouses(Array.isArray(data) ? data : [])
    } catch {
      setWarehouses([])
    }
  }

  const onSubmit = async (data: { warehouseId: string; entryTime: string; exitTime?: string; conditions?: string }) => {
    if (!data.warehouseId) {
      alert('Please select a warehouse')
      return
    }
    setLoading(true)
    try {
      if (editing) {
        await apiClient.warehouseStorages.update(editing.id, {
          warehouseId: data.warehouseId,
          entryTime: data.entryTime,
          exitTime: data.exitTime,
          conditions: data.conditions,
        })
      } else {
        await apiClient.warehouseStorages.create({
          productId,
          warehouseId: data.warehouseId,
          entryTime: data.entryTime,
          exitTime: data.exitTime,
          conditions: data.conditions,
        })
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

  const handleEdit = (storage: WarehouseStorage) => {
    setEditing(storage)
    reset({
      warehouseId: storage.warehouseId,
      entryTime: storage.entryTime ? new Date(storage.entryTime).toISOString().slice(0, 16) : '',
      exitTime: storage.exitTime ? new Date(storage.exitTime).toISOString().slice(0, 16) : '',
      conditions: storage.conditions || '',
    })
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this storage record?')) return
    try {
      await apiClient.warehouseStorages.remove(id)
      onRefresh()
    } catch (err) {
      const errorMessage = handleApiError(err)
      alert(errorMessage)
    }
  }

  const handleCreate = () => {
    setEditing(null)
    reset()
    setOpen(true)
  }

  const selectedWarehouseId = watch('warehouseId')

  return (
    <SubListCard
      title="Warehouse Storage"
      items={storages}
      columns={[
        { key: 'warehouseId', header: 'Warehouse', render: (s: WarehouseStorage) => {
          const warehouse = warehouses.find(w => w.id === s.warehouseId)
          return <span className="font-medium">{warehouse?.name || s.warehouseId}</span>
        }},
        { key: 'entryTime', header: 'Entry Time', render: (s: WarehouseStorage) => new Date(s.entryTime).toLocaleString() },
        { key: 'exitTime', header: 'Exit Time', render: (s: WarehouseStorage) => s.exitTime ? new Date(s.exitTime).toLocaleString() : '-' },
        { key: 'conditions', header: 'Conditions', render: (s: WarehouseStorage) => <span className="max-w-[200px] truncate">{s.conditions || '-'}</span>, className: 'max-w-[200px] truncate' },
      ]}
      actions={(storage: WarehouseStorage) => ({
        onEdit: () => handleEdit(storage),
        onDelete: () => handleDelete(storage.id),
      })}
      mobileCardTitle={(s: WarehouseStorage) => {
        const warehouse = warehouses.find(w => w.id === s.warehouseId)
        return warehouse?.name || s.warehouseId
      }}
      mobileCardDescription={(s: WarehouseStorage) => (
        <div className="space-y-1 text-xs text-muted-foreground">
          <div>Entry: {new Date(s.entryTime).toLocaleString()}</div>
          {s.exitTime && <div>Exit: {new Date(s.exitTime).toLocaleString()}</div>}
          {s.conditions && <div>Conditions: {s.conditions}</div>}
        </div>
      )}
      mobileCardContent={(s: WarehouseStorage) => (
        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(s)} className="flex-1">
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(s.id)}
            className="text-destructive hover:text-destructive flex-1"
          >
            Delete
          </Button>
        </div>
      )}
      emptyMessage="No storage records"
      dialogOpen={open}
      onDialogOpenChange={setOpen}
      dialogTrigger={<Button size="sm" onClick={handleCreate} className="w-full sm:w-auto">Add</Button>}
      submitting={loading}
      extraActions={
        <Button size="sm" variant="outline" asChild className="w-full sm:w-auto">
          <Link href="/dashboard/warehouses">Manage Warehouses</Link>
        </Button>
      }
      dialogContent={
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Storage Record' : 'Add Storage Record'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 px-4 py-4 min-w-0 w-full">
            <div className="grid gap-2">
              <Label>Warehouse</Label>
              <Select value={selectedWarehouseId} onValueChange={(v) => setValue('warehouseId', v)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Entry Time</Label>
              <Input type="datetime-local" {...register('entryTime', { required: true })} disabled={loading} />
            </div>
            <div className="grid gap-2">
              <Label>Exit Time (Optional)</Label>
              <Input type="datetime-local" {...register('exitTime')} disabled={loading} />
            </div>
            <div className="grid gap-2">
              <Label>Conditions (Optional)</Label>
              <Input {...register('conditions')} placeholder="e.g. Temperature: 20°C, Humidity: 60%" disabled={loading} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditing(null); reset() }} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Processing...' : editing ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </form>
      }
    />
  )
}
