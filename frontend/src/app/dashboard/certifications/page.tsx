"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Certification, Product } from '@/types/api'
import Link from 'next/link'
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

type CertificationFormData = {
  productId: string
  certName: string
  issueDate: string
  expiryDate?: string
  certHash?: string
}

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const loadCertifications = async () => {
    try {
      const data = await apiClient.certifications.findAll()
      setCertifications(Array.isArray(data) ? data : [])
    } catch {
      setCertifications([])
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
  } = useCrud<Certification, CertificationFormData>({
    loadData: loadCertifications,
    onCreate: async (data) => {
      if (!data.productId) {
        throw new Error('Please select a product')
      }
      await apiClient.certifications.create(data)
    },
    onUpdate: async (id, data) => {
      await apiClient.certifications.update(id, data)
    },
    onDelete: async (id) => {
      await apiClient.certifications.remove(id)
    },
  })

  useEffect(() => {
    loadCertifications()
    loadProducts()
  }, [])

  useEffect(() => {
    if (editing) {
      const issueDate = new Date(editing.issueDate)
      const expiryDate = editing.expiryDate ? new Date(editing.expiryDate) : null
      form.reset({
        productId: editing.productId,
        certName: editing.certName,
        issueDate: issueDate.toISOString().split('T')[0],
        expiryDate: expiryDate ? expiryDate.toISOString().split('T')[0] : '',
        certHash: editing.certHash || '',
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
        title="Certifications"
        description="Manage product certifications"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate} className="w-full sm:w-auto">Add more</Button>
            </DialogTrigger>
            <DialogContent>
              {submitting && <LoadingOverlay />}
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>{editing ? 'Edit Certification' : 'Create Certification'}</DialogTitle>
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
                    <Label htmlFor="certName">Certification Name</Label>
                    <Input
                      id="certName"
                      {...form.register('certName', { required: 'Certification name is required' })}
                      placeholder="e.g. ISO 9001, Organic Certification, Fair Trade"
                      disabled={submitting}
                    />
                    {form.formState.errors.certName && (
                      <p className="text-sm text-destructive">{form.formState.errors.certName.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      {...form.register('issueDate', { required: 'Issue date is required' })}
                      disabled={submitting}
                    />
                    {form.formState.errors.issueDate && (
                      <p className="text-sm text-destructive">{form.formState.errors.issueDate.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      {...form.register('expiryDate')}
                      disabled={submitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="certHash">Certification Hash (Optional)</Label>
                    <Input
                      id="certHash"
                      {...form.register('certHash')}
                      placeholder="e.g. Blockchain hash or certificate ID"
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
      ) : certifications.length === 0 ? (
        <EmptyState
          message="No certifications yet"
          action={{
            label: 'Add first',
            onClick: handleCreate,
          }}
        />
      ) : (
        <ResponsiveListView
          items={certifications}
          columns={[
            { key: 'certName', header: 'Certification Name', render: (c) => <span className="font-medium">{c.certName}</span> },
            { key: 'product', header: 'Product', render: (c) => getProductName(c.productId) },
            { key: 'issueDate', header: 'Issue Date', render: (c) => new Date(c.issueDate).toLocaleDateString() },
            { key: 'expiryDate', header: 'Expiry Date', render: (c) => c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : '-' },
            { key: 'certHash', header: 'Hash', render: (c) => c.certHash ? <span className="font-mono text-xs">{c.certHash.slice(0, 16)}...</span> : '-' },
          ]}
          actions={(certification) => ({
            onEdit: () => handleEdit(certification),
            onDelete: () => handleDelete(certification.id, certification),
          })}
          mobileCardTitle={(c) => c.certName}
          mobileCardDescription={(c) => getProductName(c.productId)}
          mobileCardContent={(c) => (
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Issue Date: </span>
                <span>{new Date(c.issueDate).toLocaleDateString()}</span>
              </div>
              {c.expiryDate && (
                <div>
                  <span className="text-muted-foreground">Expiry Date: </span>
                  <span>{new Date(c.expiryDate).toLocaleDateString()}</span>
                </div>
              )}
              {c.certHash && (
                <div>
                  <span className="text-muted-foreground">Hash: </span>
                  <span className="font-mono text-xs break-all">{c.certHash}</span>
                </div>
              )}
            </div>
          )}
        />
      )}
    </div>
  )
}
