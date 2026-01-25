"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Metadata, Product } from '@/types/api'
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
import { useForm } from 'react-hook-form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ActionsDropdown } from '@/components/ui/actions-dropdown'
import { LoadingOverlay } from '@/components/ui/loading'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function CollectionMetadata({ collectionId, metadata, onRefresh }: { collectionId: string; metadata: Metadata[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const { register, handleSubmit, reset, setValue, watch } = useForm<{ assetName?: string; content: string; nftReference?: string }>()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await apiClient.products.findMy()
      setProducts(Array.isArray(data) ? data.filter(p => p.policyId && p.assetName) : [])
    } catch {
      setProducts([])
    }
  }

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId)
    const product = products.find(p => p.id === productId)
    if (product && product.policyId && product.assetName) {
      const nftRef = `${product.policyId}${product.assetName}`
      setValue('nftReference', nftRef)
      setValue('assetName', product.assetName)
      setValue('content', `Product: ${product.name}`)
    }
  }

  const onSubmit = async (data: { assetName?: string; content: string; nftReference?: string }) => {
    setLoading(true)
    try {
      if (editing) {
        await apiClient.metadata.update(editing.id, {
          assetName: data.assetName,
          content: data.content,
          nftReference: data.nftReference ? [data.nftReference] : [],
        })
      } else {
        await apiClient.metadata.create({
          collectionId,
          assetName: data.assetName,
          content: data.content,
          nftReference: data.nftReference ? [data.nftReference] : undefined,
        })
      }
      setOpen(false)
      setEditing(null)
      setSelectedProductId('')
      reset()
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save metadata')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (meta: Metadata) => {
    setEditing(meta)
    setValue('assetName', meta.assetName || '')
    setValue('content', meta.content)
    setValue('nftReference', meta.nftReference && meta.nftReference.length > 0 ? meta.nftReference[0] : '')
    const product = products.find(p => p.policyId && p.assetName && meta.nftReference?.includes(`${p.policyId}${p.assetName}`))
    setSelectedProductId(product?.id || '')
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this metadata?')) return
    try {
      await apiClient.metadata.remove(id)
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const handleCreate = () => {
    setEditing(null)
    setSelectedProductId('')
    reset()
    setOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <CardTitle>Metadata</CardTitle>
        <Dialog open={open} onOpenChange={(open) => {
          setOpen(open)
          if (!open) {
            setEditing(null)
            setSelectedProductId('')
            reset()
          }
        }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={handleCreate} className="w-full sm:w-auto">Add</Button>
          </DialogTrigger>
          <DialogContent>
            {loading && <LoadingOverlay />}
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Metadata' : 'Add Metadata'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 px-4 py-4 min-w-0 w-full">
                <div className="grid gap-2">
                  <Label>Select Product (Optional)</Label>
                  <Select value={selectedProductId} onValueChange={handleProductSelect} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product to link" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.assetName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select a minted product to automatically fill NFT reference
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label>Content</Label>
                  <Input {...register('content', { required: true })} placeholder="Metadata content..." disabled={loading} />
                </div>
                <div className="grid gap-2">
                  <Label>Asset Name (Optional)</Label>
                  <Input {...register('assetName')} placeholder="e.g. NFT-001" disabled={loading} />
                </div>
                <div className="grid gap-2">
                  <Label>NFT Reference (Optional)</Label>
                  <Input {...register('nftReference')} placeholder="PolicyID + AssetName" disabled={loading} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setOpen(false)
                  setEditing(null)
                  setSelectedProductId('')
                  reset()
                }} disabled={loading}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Processing...' : editing ? 'Update' : 'Add'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {metadata.length === 0 ? (
          <p className="text-sm text-muted-foreground">No metadata</p>
        ) : (
          <>
            <div className="hidden md:block border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>NFT Reference</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metadata.map((meta) => (
                    <TableRow key={meta.id}>
                      <TableCell className="font-medium">{meta.assetName || '-'}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{meta.content}</TableCell>
                      <TableCell className="font-mono text-xs">{meta.nftReference && meta.nftReference.length > 0 ? meta.nftReference.join(', ') : '-'}</TableCell>
                      <TableCell className="text-right">
                        <ActionsDropdown
                          onEdit={() => handleEdit(meta)}
                          onDelete={() => handleDelete(meta.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="md:hidden space-y-2">
              {metadata.map((meta) => (
                <div key={meta.id} className="flex flex-col gap-2 p-2 border rounded">
                  <div className="flex-1 min-w-0">
                    {meta.assetName && <p className="font-medium text-sm truncate">{meta.assetName}</p>}
                    <p className="text-xs text-muted-foreground break-words">{meta.content}</p>
                    {meta.nftReference && meta.nftReference.length > 0 && (
                      <p className="text-xs text-muted-foreground break-words">NFT: {meta.nftReference.join(', ')}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(meta)} className="flex-1">Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(meta.id)} className="flex-1 text-destructive hover:text-destructive">Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
