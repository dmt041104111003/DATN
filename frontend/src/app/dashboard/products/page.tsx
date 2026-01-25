"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Product } from '@/types/api'
import Link from 'next/link'
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
import { useForm } from 'react-hook-form'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ name: string }>()

  useEffect(() => {
    loadProducts()
  }, [])

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

  const onSubmit = async (data: { name: string }) => {
    try {
      if (editing) {
        await apiClient.products.update(editing.id, data)
      } else {
        await apiClient.products.create(data)
      }
      setOpen(false)
      setEditing(null)
      reset()
      loadProducts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save product')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await apiClient.products.remove(id)
      loadProducts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product')
    }
  }

  const handleEdit = (product: Product) => {
    setEditing(product)
    reset({ name: product.name })
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
            <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Manage your products</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate} className="w-full sm:w-auto">Add Product</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>{editing ? 'Edit Product' : 'Create Product'}</DialogTitle>
                  <DialogDescription>
                    {editing ? 'Update product information' : 'Add a new product to your system'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Product name is required' })}
                      placeholder="e.g. Organic Coffee Beans"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
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
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No products yet</p>
              <Button className="mt-4" onClick={handleCreate}>Create your first product</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>
                    {product.policyId && product.assetName ? 'Minted' : 'Draft'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {product.policyId && (
                      <div className="break-words">
                        <span className="text-muted-foreground">Policy ID: </span>
                        <span className="font-mono text-xs break-all">{product.policyId}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-initial">
                        <Link href={`/dashboard/products/${product.id}`}>View</Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)} className="flex-1 sm:flex-initial">
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
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
    </div>
  )
}
