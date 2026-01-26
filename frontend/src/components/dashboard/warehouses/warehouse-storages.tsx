"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { WarehouseStorage, Product } from '@/types/api'
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
import { SubListCard } from '../shared/sub-list-card'
import { handleApiError } from '@/lib/utils/error-handler'
import { showAlert } from '@/lib/utils/alert'
import { confirm } from '@/lib/utils/confirm'

export function WarehouseStorages({ warehouseId, storages, onRefresh }: { warehouseId: string; storages: WarehouseStorage[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const { register, handleSubmit, reset, setValue, watch } = useForm<{ productId: string; entryTime: string; exitTime?: string; conditions?: string }>()

  const loadProducts = async () => {
    if (products.length > 0) return // Already loaded
    setProductsLoading(true)
    try {
      const data = await apiClient.products.findMy()
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }

  useEffect(() => {
    if (open && products.length === 0) {
      loadProducts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: { productId: string; entryTime: string; exitTime?: string; conditions?: string }) => {
    if (!data.productId) {
      showAlert({ description: 'Please select a product', variant: 'warning' })
      return
    }
    setLoading(true)
    try {
      await apiClient.warehouseStorages.create({
        warehouseId,
        productId: data.productId,
        entryTime: data.entryTime,
        exitTime: data.exitTime,
        conditions: data.conditions,
      })
      setOpen(false)
      reset()
      onRefresh()
    } catch (err) {
      const errorMessage = handleApiError(err)
      showAlert({ description: errorMessage, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!(await confirm('Delete this storage record?'))) return
    try {
      await apiClient.warehouseStorages.remove(id)
      onRefresh()
    } catch (err) {
      const errorMessage = handleApiError(err)
      showAlert({ description: errorMessage, variant: 'error' })
    }
  }

  const selectedProductId = watch('productId')

  return (
    <SubListCard
      title="Storage Records"
      items={storages}
      columns={[
        { key: 'productId', header: 'Product', render: (s) => {
          const product = products.find(p => p.id === s.productId)
          return <span className="font-medium">{product?.name || s.productId}</span>
        }},
        { key: 'entryTime', header: 'Entry Time', render: (s) => new Date(s.entryTime).toLocaleString() },
        { key: 'exitTime', header: 'Exit Time', render: (s) => s.exitTime ? new Date(s.exitTime).toLocaleString() : '-' },
        { key: 'conditions', header: 'Conditions', render: (s) => <span className="max-w-[200px] truncate">{s.conditions || '-'}</span>, className: 'max-w-[200px] truncate' },
      ]}
      actions={(storage) => ({
        onDelete: () => handleDelete(storage.id),
      })}
      mobileCardTitle={(s) => {
        const product = products.find(p => p.id === s.productId)
        return product?.name || s.productId
      }}
      mobileCardDescription={(s) => (
        <span className="text-xs text-muted-foreground break-words">
          Entry: {new Date(s.entryTime).toLocaleString()}
          {s.exitTime && ` | Exit: ${new Date(s.exitTime).toLocaleString()}`}
          {s.conditions && ` | ${s.conditions}`}
        </span>
      )}
      emptyMessage="No storage records"
      dialogOpen={open}
      onDialogOpenChange={setOpen}
      dialogTrigger={<Button size="sm" className="w-full sm:w-auto">Add</Button>}
      submitting={loading}
      dialogContent={
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Storage Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 px-4 py-4 min-w-0 w-full">
            <div className="grid gap-2">
              <Label>Product</Label>
              <Select value={selectedProductId} onValueChange={(v) => setValue('productId', v)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Add'}</Button>
          </DialogFooter>
        </form>
      }
    />
  )
}
