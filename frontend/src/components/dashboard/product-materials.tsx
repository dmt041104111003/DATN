"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { ProductMaterial, Material } from '@/types/api'
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

export function ProductMaterials({ productId, productMaterials, onRefresh }: { productId: string; productMaterials: ProductMaterial[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const [materials, setMaterials] = useState<Material[]>([])
  const [materialsLoading, setMaterialsLoading] = useState(false)
  const { register, handleSubmit, reset, setValue, watch } = useForm<{ materialId: string; quantity: number; unit?: string }>()

  const loadMaterials = async () => {
    if (materials.length > 0) return // Already loaded
    setMaterialsLoading(true)
    try {
      const data = await apiClient.materials.findAll()
      setMaterials(Array.isArray(data) ? data : [])
    } catch {
      setMaterials([])
    } finally {
      setMaterialsLoading(false)
    }
  }

  useEffect(() => {
    if (open && materials.length === 0) {
      loadMaterials()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onSubmit = async (data: { materialId: string; quantity: number; unit?: string }) => {
    if (!data.materialId) {
      alert('Please select a material')
      return
    }
    try {
      await apiClient.productMaterials.create({ ...data, productId })
      setOpen(false)
      reset()
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add material')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this material?')) return
    try {
      await apiClient.productMaterials.remove(id)
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove')
    }
  }

  const selectedMaterialId = watch('materialId')

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <CardTitle>Materials</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">Add</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Add Material</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Material</Label>
                  <Select value={selectedMaterialId} onValueChange={(v) => setValue('materialId', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Quantity</Label>
                  <Input type="number" {...register('quantity', { required: true, valueAsNumber: true })} placeholder="e.g. 10" />
                </div>
                <div className="grid gap-2">
                  <Label>Unit (Optional)</Label>
                  <Input {...register('unit')} placeholder="e.g. kg, lbs, pieces" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Add</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {productMaterials.length === 0 ? (
            <p className="text-sm text-muted-foreground">No materials</p>
          ) : (
              productMaterials.map((pm) => {
              const material = materials.find(m => m.id === pm.materialId)
              return (
                <div key={pm.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 border rounded">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{material?.name || pm.materialId}</p>
                    <p className="text-xs text-muted-foreground">
                      {pm.quantity} {pm.unit || ''}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(pm.id)} className="w-full sm:w-auto shrink-0">Remove</Button>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
