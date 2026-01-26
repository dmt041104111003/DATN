"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Material, Supplier } from '@/types/api'
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
import { LoadingOverlay, LoadingPage } from '@/components/ui/loading'
import { PageHeader } from '@/components/dashboard/shared/page-header'
import { ResponsiveListView } from '@/components/dashboard/shared/responsive-list-view'
import { EmptyState } from '@/components/dashboard/shared/empty-state'
import { useCrud } from '@/hooks/use-crud'

type MaterialFormData = {
  supplierId: string
  name: string
  harvestDate?: string
  quantity?: number
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  const loadMaterials = async () => {
    try {
      const data = await apiClient.materials.findAll()
      setMaterials(Array.isArray(data) ? data : [])
    } catch {
      setMaterials([])
    } finally {
      setLoading(false)
    }
  }

  const loadSuppliers = async () => {
    try {
      const data = await apiClient.suppliers.findAll()
      setSuppliers(Array.isArray(data) ? data : [])
    } catch {
      setSuppliers([])
    }
  }

  const {
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
  } = useCrud<Material, MaterialFormData>({
    loadData: loadMaterials,
    onCreate: async (data) => {
      if (!data.supplierId) {
        throw new Error('Please select a supplier')
      }
      await apiClient.materials.create(data)
    },
    onUpdate: async (id, data) => {
      if (!data.supplierId) {
        throw new Error('Please select a supplier')
      }
      await apiClient.materials.update(id, data)
    },
    onDelete: async (id) => {
      await apiClient.materials.remove(id)
    },
  })

  useEffect(() => {
    loadMaterials()
    loadSuppliers()
  }, [])

  useEffect(() => {
    if (editing) {
      form.reset({
        supplierId: editing.supplierId,
        name: editing.name,
        harvestDate: editing.harvestDate ? editing.harvestDate.split('T')[0] : '',
        quantity: editing.quantity,
      })
    }
  }, [editing, form])

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Materials"
        description="Manage raw materials"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate} className="w-full sm:w-auto">Add more</Button>
            </DialogTrigger>
            <DialogContent>
              {submitting && <LoadingOverlay />}
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>{editing ? 'Edit Material' : 'Create Material'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 px-4 py-4 min-w-0 w-full">
                  <div className="grid gap-2">
                    <Label htmlFor="supplierId">Supplier</Label>
                    <Select
                      value={form.watch('supplierId')}
                      onValueChange={(value) => form.setValue('supplierId', value)}
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
                    {form.formState.errors.supplierId && (
                      <p className="text-sm text-destructive">{form.formState.errors.supplierId.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Material Name</Label>
                    <Input
                      id="name"
                      {...form.register('name', { required: 'Material name is required' })}
                      placeholder="e.g. Coffee Beans, Cotton, Wheat"
                      disabled={submitting}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="harvestDate">Harvest Date (Optional)</Label>
                    <Input
                      id="harvestDate"
                      type="date"
                      {...form.register('harvestDate')}
                      disabled={submitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity (Optional)</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      {...form.register('quantity', { valueAsNumber: true })}
                      placeholder="e.g. 100.5"
                      disabled={submitting}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Processing...' : editing ? 'Update' : 'Create'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <LoadingPage />
      ) : materials.length === 0 ? (
        <EmptyState
          message="No materials yet"
          action={{
            label: 'Add first',
            onClick: handleCreate,
          }}
        />
      ) : (
        <ResponsiveListView
          items={materials}
          columns={[
            { key: 'name', header: 'Name', render: (m) => <span className="font-medium">{m.name}</span> },
            { key: 'supplier', header: 'Supplier', render: (m) => m.supplier?.name || 'No supplier' },
            { key: 'quantity', header: 'Quantity', render: (m) => m.quantity || '-' },
            { key: 'harvestDate', header: 'Harvest Date', render: (m) => m.harvestDate ? new Date(m.harvestDate).toLocaleDateString() : '-' },
          ]}
          actions={(material) => ({
            viewHref: `/dashboard/materials/${material.id}`,
            onEdit: () => handleEdit(material),
            onDelete: () => handleDelete(material.id, material),
          })}
          mobileCardTitle={(m) => m.name}
          mobileCardDescription={(m) => m.supplier?.name || 'No supplier'}
          mobileCardContent={(m) => (
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Quantity: </span>
                <span>{m.quantity || '-'}</span>
              </div>
              {m.harvestDate && (
                <div>
                  <span className="text-muted-foreground">Harvest: </span>
                  <span>{new Date(m.harvestDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}
        />
      )}
    </div>
  )
}
