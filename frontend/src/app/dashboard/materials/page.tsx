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
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ActionsDropdown } from '@/components/ui/actions-dropdown'
import { LoadingOverlay, LoadingPage } from '@/components/ui/loading'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

type Tab = 'materials' | 'suppliers'

export default function MaterialsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('materials')
  const [materials, setMaterials] = useState<Material[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
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
    setSubmitting(true)
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
    } finally {
      setSubmitting(false)
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Materials</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Manage raw materials and suppliers</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="materials">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleCreate} className="w-full sm:w-auto">Add more</Button>
                </DialogTrigger>
            <DialogContent>
              {submitting && <LoadingOverlay />}
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>{editing ? 'Edit Material' : 'Create Material'}</DialogTitle>
                  <DialogDescription>
                    {editing ? 'Update material information' : 'Add a new raw material'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 px-4 py-4 min-w-0 w-full">
                  <div className="grid gap-2">
                    <Label htmlFor="supplierId">Supplier</Label>
                    <Select
                      value={watch('supplierId')}
                      onValueChange={(value) => setValue('supplierId', value)}
                      disabled={submitting}
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
                      disabled={submitting}
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
                        disabled={submitting}
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
                        disabled={submitting}
                      />
                    </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Processing...' : editing ? 'Update' : 'Create'}</Button>
                </DialogFooter>
              </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <LoadingPage />
          ) : materials.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No materials yet</p>
                <div className="flex justify-center mt-4">
                  <Button onClick={handleCreate}>Add first</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="hidden md:block border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Harvest Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell>{material.supplier?.name || 'No supplier'}</TableCell>
                        <TableCell>{material.quantity || '-'}</TableCell>
                        <TableCell>{material.harvestDate ? new Date(material.harvestDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell className="text-right">
                          <ActionsDropdown
                            onEdit={() => handleEdit(material)}
                            onDelete={() => handleDelete(material.id)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="md:hidden space-y-2">
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
                          <span>{material.quantity || '-'}</span>
                        </div>
                        {material.harvestDate && (
                          <div>
                            <span className="text-muted-foreground">Harvest: </span>
                            <span>{new Date(material.harvestDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(material)} className="flex-1">
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(material.id)}
                            className="text-destructive hover:text-destructive flex-1"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="suppliers">
          <MaterialSuppliers suppliers={suppliers} onRefresh={loadData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
