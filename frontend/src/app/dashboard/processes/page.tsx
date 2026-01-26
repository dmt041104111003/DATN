"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { ProductionProcess, Product } from '@/types/api'
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
import Link from 'next/link'

type ProcessFormData = {
  productId: string
  stepName: string
  startTime: string
  endTime?: string
  location?: string
}

export default function ProcessesPage() {
  const router = useRouter()
  const [processes, setProcesses] = useState<ProductionProcess[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const loadProcesses = async () => {
    try {
      const data = await apiClient.productionProcesses.findAll()
      setProcesses(Array.isArray(data) ? data : [])
    } catch {
      setProcesses([])
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const data = await apiClient.products.findMy()
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      setProducts([])
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
  } = useCrud<ProductionProcess, ProcessFormData>({
    loadData: loadProcesses,
    onCreate: async (data) => {
      if (!data.productId) {
        throw new Error('Please select a product')
      }
      await apiClient.productionProcesses.create(data)
    },
    onUpdate: async (id, data) => {
      await apiClient.productionProcesses.update(id, data)
    },
    onDelete: async (id) => {
      await apiClient.productionProcesses.remove(id)
    },
    redirectOnSubscriptionError: true,
  })

  useEffect(() => {
    loadProcesses()
    loadProducts()
  }, [])

  useEffect(() => {
    if (editing) {
      const startTime = new Date(editing.startTime)
      const endTime = editing.endTime ? new Date(editing.endTime) : null
      form.reset({
        productId: editing.productId,
        stepName: editing.stepName,
        startTime: startTime.toISOString().slice(0, 16),
        endTime: endTime ? endTime.toISOString().slice(0, 16) : '',
        location: editing.location || '',
      })
    }
  }, [editing, form])

  // Get product name for display
  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId)
    return product?.name || 'Unknown Product'
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Production Processes"
        description="Manage production processes"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate} className="w-full sm:w-auto">Add more</Button>
            </DialogTrigger>
            <DialogContent>
              {submitting && <LoadingOverlay />}
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>{editing ? 'Edit Process' : 'Create Process'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 px-4 py-4 min-w-0 w-full">
                  <div className="grid gap-2">
                    <Label htmlFor="productId">Product *</Label>
                    {products.length === 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">No products available. Please create a product first.</p>
                        <Link href="/dashboard/products">
                          <Button type="button" variant="outline" className="w-full">Create Product</Button>
                        </Link>
                      </div>
                    ) : (
                      <Select
                        value={form.watch('productId')}
                        onValueChange={(value) => form.setValue('productId', value)}
                        disabled={submitting || !!editing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {form.formState.errors.productId && (
                      <p className="text-sm text-destructive">{form.formState.errors.productId.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stepName">Step Name</Label>
                    <Input
                      id="stepName"
                      {...form.register('stepName', { required: 'Step name is required' })}
                      placeholder="e.g. Harvesting, Processing, Packaging"
                      disabled={submitting}
                    />
                    {form.formState.errors.stepName && (
                      <p className="text-sm text-destructive">{form.formState.errors.stepName.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      {...form.register('startTime', { required: 'Start time is required' })}
                      disabled={submitting}
                    />
                    {form.formState.errors.startTime && (
                      <p className="text-sm text-destructive">{form.formState.errors.startTime.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">End Time (Optional)</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      {...form.register('endTime')}
                      disabled={submitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location (Optional)</Label>
                    <Input
                      id="location"
                      {...form.register('location')}
                      placeholder="e.g. Factory A, Warehouse B"
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
      ) : processes.length === 0 ? (
        <EmptyState
          message="No processes yet"
          action={{
            label: 'Add first',
            onClick: handleCreate,
          }}
        />
      ) : (
        <ResponsiveListView
          items={processes}
          columns={[
            { key: 'stepName', header: 'Step Name', render: (p) => <span className="font-medium">{p.stepName}</span> },
            { key: 'product', header: 'Product', render: (p) => getProductName(p.productId) },
            { key: 'startTime', header: 'Start Time', render: (p) => new Date(p.startTime).toLocaleString() },
            { key: 'endTime', header: 'End Time', render: (p) => p.endTime ? new Date(p.endTime).toLocaleString() : '-' },
            { key: 'location', header: 'Location', render: (p) => p.location || '-' },
          ]}
          actions={(process) => ({
            onEdit: () => handleEdit(process),
            onDelete: () => handleDelete(process.id, process),
          })}
          mobileCardTitle={(p) => p.stepName}
          mobileCardDescription={(p) => getProductName(p.productId)}
          mobileCardContent={(p) => (
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Start: </span>
                <span>{new Date(p.startTime).toLocaleString()}</span>
              </div>
              {p.endTime && (
                <div>
                  <span className="text-muted-foreground">End: </span>
                  <span>{new Date(p.endTime).toLocaleString()}</span>
                </div>
              )}
              {p.location && (
                <div>
                  <span className="text-muted-foreground">Location: </span>
                  <span>{p.location}</span>
                </div>
              )}
            </div>
          )}
        />
      )}
    </div>
  )
}
