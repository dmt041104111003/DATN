"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Material, Supplier } from '@/types/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { MaterialSuppliers } from '@/components/dashboard/material-suppliers'

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Material | null>(null)
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<{
    supplierId: string
    name: string
    harvestDate?: string
    quantity?: number
  }>()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [materialsData, suppliersData] = await Promise.all([
        apiClient.materials.findAll().catch(() => []),
        apiClient.suppliers.findAll().catch(() => []),
      ])
      setMaterials(Array.isArray(materialsData) ? materialsData : [])
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : [])
    } catch {
      setMaterials([])
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: { supplierId: string; name: string; harvestDate?: string; quantity?: number }) => {
    if (!data.supplierId) {
      alert('Please select a supplier')
      return
    }
    try {
      if (editing) {
        await apiClient.materials.update(editing.id, data)
      } else {
        await apiClient.materials.create(data)
      }
      setOpen(false)
      setEditing(null)
      reset()
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save material')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return
    try {
      await apiClient.materials.remove(id)
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete material')
    }
  }

  const handleEdit = (material: Material) => {
    setEditing(material)
    reset({
      supplierId: material.supplierId,
      name: material.name,
      harvestDate: material.harvestDate ? material.harvestDate.split('T')[0] : '',
      quantity: material.quantity,
    })
    setOpen(true)
  }

  const handleCreate = () => {
    setEditing(null)
    reset()
    setOpen(true)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Materials</h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Manage raw materials</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate} className="w-full sm:w-auto">Add Material</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>{editing ? 'Edit Material' : 'Create Material'}</DialogTitle>
                  <DialogDescription>
                    {editing ? 'Update material information' : 'Add a new raw material'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="supplierId">Supplier</Label>
                    <Select
                      value={watch('supplierId')}
                      onValueChange={(value) => setValue('supplierId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.supplierId && (
                      <p className="text-sm text-destructive">{errors.supplierId.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Material Name</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Material name is required' })}
                      placeholder="e.g. Coffee Beans, Cotton, Wheat"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="harvestDate">Harvest Date (Optional)</Label>
                    <Input
                      id="harvestDate"
                      type="date"
                      {...register('harvestDate')}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity (Optional)</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      {...register('quantity', { valueAsNumber: true })}
                      placeholder="e.g. 100.5"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="h-4 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : materials.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No materials yet</p>
              <Button className="mt-4" onClick={handleCreate}>Add your first material</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
              <Card key={material.id}>
                <CardHeader>
                  <CardTitle>{material.name}</CardTitle>
                  <CardDescription>
                    {material.supplier?.name || 'No supplier'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Quantity: </span>
                      <span>{material.quantity}</span>
                    </div>
                    {material.harvestDate && (
                      <div>
                        <span className="text-muted-foreground">Harvest: </span>
                        <span>{new Date(material.harvestDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(material)} className="flex-1 sm:flex-initial">
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(material.id)}
                        className="text-destructive hover:text-destructive flex-1 sm:flex-initial"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      <MaterialSuppliers suppliers={suppliers} onRefresh={loadData} />
    </div>
  )
}
