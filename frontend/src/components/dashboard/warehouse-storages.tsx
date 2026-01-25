"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { WarehouseStorage, Product } from '@/types/api'
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
      alert('Please select a product')
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
      alert(err instanceof Error ? err.message : 'Failed to create storage record')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this storage record?')) return
    try {
      await apiClient.warehouseStorages.remove(id)
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const selectedProductId = watch('productId')

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <CardTitle>Storage Records</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">Add</Button>
          </DialogTrigger>
          <DialogContent>
            {loading && <LoadingOverlay />}
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
          </DialogContent>
        </Dialog>
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
                    <TableHead>Product</TableHead>
                    <TableHead>Entry Time</TableHead>
                    <TableHead>Exit Time</TableHead>
                    <TableHead>Conditions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storages.map((storage) => {
                    const product = products.find(p => p.id === storage.productId)
                    return (
                      <TableRow key={storage.id}>
                        <TableCell className="font-medium">{product?.name || storage.productId}</TableCell>
                        <TableCell>{new Date(storage.entryTime).toLocaleString()}</TableCell>
                        <TableCell>{storage.exitTime ? new Date(storage.exitTime).toLocaleString() : '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{storage.conditions || '-'}</TableCell>
                        <TableCell className="text-right">
                          <ActionsDropdown
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
                const product = products.find(p => p.id === storage.productId)
                return (
                  <div key={storage.id} className="flex flex-col gap-2 p-2 border rounded">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product?.name || storage.productId}</p>
                      <p className="text-xs text-muted-foreground break-words">
                        Entry: {new Date(storage.entryTime).toLocaleString()}
                        {storage.exitTime && ` | Exit: ${new Date(storage.exitTime).toLocaleString()}`}
                        {storage.conditions && ` | ${storage.conditions}`}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(storage.id)} className="w-full text-destructive hover:text-destructive">Delete</Button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
