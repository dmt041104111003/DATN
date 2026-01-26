"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Warehouse } from '@/types/api'
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
import { LoadingOverlay, LoadingPage } from '@/components/ui/loading'
import { PageHeader } from '@/components/dashboard/shared/page-header'
import { ResponsiveListView } from '@/components/dashboard/shared/responsive-list-view'
import { EmptyState } from '@/components/dashboard/shared/empty-state'
import { useCrud } from '@/hooks/use-crud'

type WarehouseFormData = {
  name: string
  location?: string
  capacity?: number
}

export default function WarehousesPage() {
  const router = useRouter()
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)

  const loadWarehouses = async () => {
    try {
      const data = await apiClient.warehouses.findAll()
      setWarehouses(Array.isArray(data) ? data : [])
    } catch {
      setWarehouses([])
    } finally {
      setLoading(false)
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
  } = useCrud<Warehouse, WarehouseFormData>({
    loadData: loadWarehouses,
    onCreate: async (data) => {
      if (data.capacity !== undefined && data.capacity < 0) {
        throw new Error('Warehouse capacity must be greater than or equal to 0')
      }
      await apiClient.warehouses.create(data)
    },
    onUpdate: async (id, data) => {
      if (data.capacity !== undefined && data.capacity < 0) {
        throw new Error('Warehouse capacity must be greater than or equal to 0')
      }
      await apiClient.warehouses.update(id, data)
    },
    onDelete: async (id) => {
      await apiClient.warehouses.remove(id)
    },
    redirectOnSubscriptionError: true,
  })

  useEffect(() => {
    loadWarehouses()
  }, [])

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        location: editing.location || '',
        capacity: editing.capacity,
      })
    }
  }, [editing, form])

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Warehouses"
        description="Manage storage facilities"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate} className="w-full sm:w-auto">Add more</Button>
            </DialogTrigger>
            <DialogContent>
              {submitting && <LoadingOverlay />}
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>{editing ? 'Edit Warehouse' : 'Create Warehouse'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 px-4 py-4 min-w-0 w-full">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Warehouse Name</Label>
                    <Input
                      id="name"
                      {...form.register('name', { required: 'Warehouse name is required' })}
                      placeholder="e.g. Main Warehouse, Storage Facility A"
                      disabled={submitting}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location (Optional)</Label>
                    <Input
                      id="location"
                      {...form.register('location')}
                      placeholder="e.g. 123 Main St, City, Country"
                      disabled={submitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="capacity">Capacity (Optional)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      {...form.register('capacity', { 
                        valueAsNumber: true,
                        min: { value: 0, message: 'Warehouse capacity must be greater than or equal to 0' }
                      })}
                      placeholder="e.g. 1000"
                      disabled={submitting}
                    />
                    {form.formState.errors.capacity && (
                      <p className="text-sm text-destructive">{form.formState.errors.capacity.message}</p>
                    )}
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
      ) : warehouses.length === 0 ? (
        <EmptyState
          message="No warehouses yet"
          action={{
            label: 'Add first warehouse',
            onClick: handleCreate,
          }}
        >
          <p className="text-sm text-muted-foreground mb-4">Create warehouses to manage your product storage</p>
        </EmptyState>
      ) : (
        <ResponsiveListView
          items={warehouses}
          columns={[
            { key: 'name', header: 'Name', render: (w) => <span className="font-medium">{w.name}</span> },
            { key: 'location', header: 'Location', render: (w) => <span className="max-w-[200px] truncate">{w.location || '-'}</span>, className: 'max-w-[200px] truncate' },
            { key: 'capacity', header: 'Capacity', render: (w) => w.capacity || '-' },
          ]}
          actions={(warehouse) => ({
            viewHref: `/dashboard/warehouses/${warehouse.id}`,
            onEdit: () => handleEdit(warehouse),
            onDelete: () => handleDelete(warehouse.id, warehouse),
          })}
          mobileCardTitle={(w) => w.name}
          mobileCardDescription={(w) => w.location || undefined}
          mobileCardContent={(w) => (
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Capacity: </span>
                <span>{w.capacity || '-'}</span>
              </div>
            </div>
          )}
        />
      )}
    </div>
  )
}
