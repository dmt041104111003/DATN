"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { WarehouseStorage, Warehouse } from '@/types/api'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ActionsDropdown } from '@/components/ui/actions-dropdown'
import { LoadingOverlay } from '@/components/ui/loading'

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
      alert(err instanceof Error ? err.message : editing ? 'Failed to update storage record' : 'Failed to create storage record')
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
      alert(err instanceof Error ? err.message : 'Failed to delete storage record')
    }
  }

  const handleCreate = () => {
    setEditing(null)
    reset()
    setOpen(true)
  }

  const selectedWarehouseId = watch('warehouseId')

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <CardTitle>Warehouse Storage</CardTitle>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button size="sm" variant="outline" asChild className="flex-1 sm:flex-none">
            <Link href="/dashboard/warehouses">Manage Warehouses</Link>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={handleCreate} className="flex-1 sm:flex-none">Add</Button>
            </DialogTrigger>
          <DialogContent>
            {loading && <LoadingOverlay />}
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
          </DialogContent>
        </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {storages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No storage records</p>
        ) : (
          <>
            <div className="hidden md:block border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Entry Time</TableHead>
                    <TableHead>Exit Time</TableHead>
                    <TableHead>Conditions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storages.map((storage) => {
                    const warehouse = warehouses.find(w => w.id === storage.warehouseId)
                    return (
                      <TableRow key={storage.id}>
                        <TableCell className="font-medium">{warehouse?.name || storage.warehouseId}</TableCell>
                        <TableCell>{new Date(storage.entryTime).toLocaleString()}</TableCell>
                        <TableCell>{storage.exitTime ? new Date(storage.exitTime).toLocaleString() : '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{storage.conditions || '-'}</TableCell>
                        <TableCell className="text-right">
                          <ActionsDropdown
                            onEdit={() => handleEdit(storage)}
                            onDelete={() => handleDelete(storage.id)}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="md:hidden space-y-2">
              {storages.map((storage) => {
                const warehouse = warehouses.find(w => w.id === storage.warehouseId)
                return (
                  <Card key={storage.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{warehouse?.name || storage.warehouseId}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Entry: </span>
                          <span>{new Date(storage.entryTime).toLocaleString()}</span>
                        </div>
                        {storage.exitTime && (
                          <div>
                            <span className="text-muted-foreground">Exit: </span>
                            <span>{new Date(storage.exitTime).toLocaleString()}</span>
                          </div>
                        )}
                        {storage.conditions && (
                          <div>
                            <span className="text-muted-foreground">Conditions: </span>
                            <span>{storage.conditions}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(storage)} className="flex-1">
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(storage.id)}
                            className="text-destructive hover:text-destructive flex-1"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
