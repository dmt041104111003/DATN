"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Product } from '@/types/api'
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
import { StatusBadge } from '@/components/ui/status-badge'
import { LoadingOverlay, LoadingPage } from '@/components/ui/loading'
import { PageHeader } from '@/components/dashboard/page-header'
import { ResponsiveListView } from '@/components/dashboard/responsive-list-view'
import { EmptyState } from '@/components/dashboard/empty-state'
import { useCrud } from '@/hooks/use-crud'

type ProductFormData = {
  name: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const loadProducts = async () => {
    try {
      const data = await apiClient.products.findMy()
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      setProducts([])
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
  } = useCrud<Product, ProductFormData>({
    loadData: loadProducts,
    onCreate: async (data) => {
      await apiClient.products.create(data)
    },
    onUpdate: async (id, data) => {
      await apiClient.products.update(id, data)
    },
    onDelete: async (id) => {
      const product = products.find(p => p.id === id)
      const result = await apiClient.products.remove(id)
      if (result?.wasMinted) {
        alert(`Product deleted successfully.\n\n⚠️ Note: This product was minted as NFT. On-chain blockchain data cannot be deleted, but off-chain metadata has been removed.`)
      } else {
        alert('Product deleted successfully.')
      }
    },
    getDeleteConfirmMessage: (product) => {
      const isMinted = product?.policyId && product?.assetName
      if (isMinted) {
        return 'Are you sure you want to delete this product?\n\n⚠️ WARNING: This product has been minted as NFT.\n\nOn-chain blockchain data cannot be deleted, but off-chain metadata will be removed from the system.\n\nThis action cannot be undone.'
      }
      return 'Are you sure you want to delete this product?\n\nThis action cannot be undone.'
    },
    redirectOnSubscriptionError: true,
  })

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    if (editing) {
      form.reset({ name: editing.name })
    }
  }, [editing, form])

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Products"
        description="Manage your products"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate} className="w-full sm:w-auto">Add more</Button>
            </DialogTrigger>
            <DialogContent>
              {submitting && <LoadingOverlay />}
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>{editing ? 'Edit Product' : 'Create Product'}</DialogTitle>
                  <DialogDescription>
                    {editing ? 'Update product information' : 'Add a new product to your system'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 px-4 min-w-0 w-full">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      {...form.register('name', { required: 'Product name is required' })}
                      placeholder="e.g. Organic Coffee Beans"
                      disabled={submitting}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
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
      ) : products.length === 0 ? (
        <EmptyState
          message="No products yet"
          action={{
            label: 'Add first',
            onClick: handleCreate,
          }}
        />
      ) : (
        <ResponsiveListView
          items={products}
          columns={[
            { key: 'name', header: 'Name', render: (p) => <span className="font-medium">{p.name}</span> },
            { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.policyId && p.assetName ? 'Minted' : 'Draft'} /> },
            { key: 'policyId', header: 'Policy ID', render: (p) => <span className="font-mono text-xs">{p.policyId ? p.policyId.slice(0, 16) + '...' : '-'}</span>, className: 'font-mono text-xs' },
          ]}
          actions={(product) => ({
            viewHref: `/dashboard/products/${product.id}`,
            onEdit: () => handleEdit(product),
            onDelete: () => handleDelete(product.id, product),
          })}
          mobileCardTitle={(p) => p.name}
          mobileCardDescription={(p) => p.policyId && p.assetName ? 'Minted' : 'Draft'}
          mobileCardContent={(p) => (
            <div className="space-y-2 text-sm">
              {p.policyId && (
                <div className="break-words">
                  <span className="text-muted-foreground">Policy ID: </span>
                  <span className="font-mono text-xs break-all">{p.policyId}</span>
                </div>
              )}
            </div>
          )}
        />
      )}
    </div>
  )
}
