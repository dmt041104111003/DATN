"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  DialogDescription,
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
import { LoadingOverlay } from '@/components/ui/loading'
import { SubListCard } from '../shared/sub-list-card'
import { handleApiError } from '@/lib/utils/error-handler'
import { showAlert } from '@/lib/utils/alert'
import { confirm } from '@/lib/utils/confirm'

export function ProductMaterials({ productId, productMaterials, onRefresh }: { productId: string; productMaterials: ProductMaterial[]; onRefresh: () => void }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewingPm, setViewingPm] = useState<ProductMaterial | null>(null)
  const [editing, setEditing] = useState<ProductMaterial | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [materialsLoading, setMaterialsLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<{ materialId: string; quantity: number; unit?: string }>()

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
    if (materials.length === 0) {
      loadMaterials()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (data: { materialId: string; quantity: number; unit?: string }) => {
    if (!data.materialId) {
      showAlert({ description: 'Please select a material', variant: 'warning' })
      return
    }
    if (data.quantity <= 0) {
      showAlert({ description: 'Quantity must be greater than 0', variant: 'warning' })
      return
    }
    
    setLoading(true)
    try {
      if (editing) {
        await apiClient.productMaterials.update(editing.id, data)
      } else {
        await apiClient.productMaterials.create({ ...data, productId })
      }
      setOpen(false)
      setEditing(null)
      reset()
      onRefresh()
    } catch (err) {
      const errorMessage = handleApiError(err, router)
      showAlert({ description: errorMessage, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (pm: ProductMaterial) => {
    setEditing(pm)
    setValue('materialId', pm.materialId)
    setValue('quantity', pm.quantity)
    setValue('unit', pm.unit || '')
    setOpen(true)
  }

  const handleView = async (pm: ProductMaterial) => {
    try {
      const data = await apiClient.productMaterials.findOne(pm.id) as any
      if (data && data.material) {
        if (!materials.find(m => m.id === data.material.id)) {
          setMaterials([...materials, data.material])
        }
      }
      setViewingPm(data || pm)
      setViewOpen(true)
    } catch {
      setViewingPm(pm)
      setViewOpen(true)
    }
  }

  const handleDelete = async (id: string) => {
    if (!(await confirm('Delete this material from the product?'))) return
    try {
      await apiClient.productMaterials.remove(id)
      onRefresh()
    } catch (err) {
      const errorMessage = handleApiError(err, router)
      showAlert({ description: errorMessage, variant: 'error' })
    }
  }

  const handleCreate = () => {
    setEditing(null)
    reset()
    setOpen(true)
  }

  const selectedMaterialId = watch('materialId')

  return (
    <SubListCard
      title="Materials"
      items={productMaterials}
      columns={[
        { key: 'materialId', header: 'Material', render: (pm: ProductMaterial) => {
          const material = materials.find(m => m.id === pm.materialId)
          return <span className="font-medium">{material?.name || pm.materialId}</span>
        }},
        { key: 'quantity', header: 'Quantity', render: (pm: ProductMaterial) => pm.quantity },
        { key: 'unit', header: 'Unit', render: (pm: ProductMaterial) => pm.unit || '-' },
      ]}
      actions={(pm: ProductMaterial) => ({
        onView: () => handleView(pm),
        onEdit: () => handleEdit(pm),
        onDelete: () => handleDelete(pm.id),
      })}
      mobileCardTitle={(pm: ProductMaterial) => {
        const material = materials.find(m => m.id === pm.materialId)
        return material?.name || pm.materialId
      }}
      mobileCardDescription={(pm: ProductMaterial) => (
        <span className="text-xs text-muted-foreground">
          {pm.quantity} {pm.unit || ''}
        </span>
      )}
      emptyContent={
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-4">No materials yet</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button size="sm" onClick={handleCreate} variant="outline">
              Add Material
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/materials">Manage Materials</Link>
            </Button>
          </div>
        </div>
      }
      dialogOpen={open}
      onDialogOpenChange={(open: boolean) => {
        setOpen(open)
        if (!open) {
          setEditing(null)
          reset()
        }
      }}
      dialogTrigger={<Button size="sm" onClick={handleCreate} className="w-full sm:w-auto">Add</Button>}
      submitting={loading}
      viewDialog={
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Material Details</DialogTitle>
              <DialogDescription>
                View material information and supplier details
              </DialogDescription>
            </DialogHeader>
            {viewingPm && (
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Material Name</Label>
                  <p className="text-sm">{(viewingPm as any).material?.name || materials.find(m => m.id === viewingPm.materialId)?.name || viewingPm.materialId}</p>
                </div>
                {(viewingPm as any).material?.harvestDate && (
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Harvest Date</Label>
                    <p className="text-sm">{new Date((viewingPm as any).material.harvestDate).toLocaleDateString()}</p>
                  </div>
                )}
                {(viewingPm as any).material?.supplier && (
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Supplier</Label>
                    <p className="text-sm">{(viewingPm as any).material.supplier.name}</p>
                    {(viewingPm as any).material.supplier.location && (
                      <p className="text-xs text-muted-foreground">{(viewingPm as any).material.supplier.location}</p>
                    )}
                  </div>
                )}
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Quantity</Label>
                  <p className="text-sm">{viewingPm.quantity} {viewingPm.unit || ''}</p>
                </div>
                {viewingPm.unit && (
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Unit</Label>
                    <p className="text-sm">{viewingPm.unit}</p>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Created At</Label>
                  <p className="text-sm">{new Date(viewingPm.createdAt).toLocaleString()}</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Updated At</Label>
                  <p className="text-sm">{new Date(viewingPm.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
      dialogContent={
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Material' : 'Add Material'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 px-4 py-4 min-w-0 w-full">
            <div className="grid gap-2">
              <Label>Material *</Label>
              <Select 
                value={selectedMaterialId} 
                onValueChange={(v) => setValue('materialId', v)} 
                disabled={loading || editing !== null}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedMaterialId && (
                <p className="text-sm text-destructive">Please select a material</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Quantity *</Label>
              <Input 
                type="number" 
                step="0.01"
                {...register('quantity', { 
                  required: 'Please enter quantity',
                  valueAsNumber: true,
                  min: { value: 0.01, message: 'Quantity must be greater than 0' }
                })} 
                placeholder="e.g. 10" 
                disabled={loading}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Unit (Optional)</Label>
              <Input {...register('unit')} placeholder="e.g. kg, lbs, pieces" disabled={loading} />
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
