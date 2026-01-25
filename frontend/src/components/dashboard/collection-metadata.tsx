"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Metadata, Product } from '@/types/api'
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SubListCard } from './sub-list-card'
import { handleApiError } from '@/lib/utils/error-handler'

export function CollectionMetadata({ collectionId, metadata, onRefresh }: { collectionId: string; metadata: Metadata[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('__none__')
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
    if (productId === '__none__') {
      setValue('nftReference', '')
      setValue('assetName', '')
      setValue('content', '')
      return
    }
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
      setSelectedProductId('__none__')
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
    setSelectedProductId(product?.id || '__none__')
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this metadata?')) return
    try {
      await apiClient.metadata.remove(id)
      onRefresh()
    } catch (err) {
      const errorMessage = handleApiError(err)
      alert(errorMessage)
    }
  }

  const handleCreate = () => {
    setEditing(null)
    setSelectedProductId('__none__')
    reset()
    setOpen(true)
  }

  return (
    <SubListCard
      title="Metadata"
      items={metadata}
      columns={[
        { key: 'assetName', header: 'Asset Name', render: (m) => <span className="font-medium">{m.assetName || '-'}</span> },
        { key: 'content', header: 'Content', render: (m) => <span className="max-w-[300px] truncate">{m.content}</span>, className: 'max-w-[300px] truncate' },
        { key: 'nftReference', header: 'NFT Reference', render: (m) => <span className="font-mono text-xs">{m.nftReference && m.nftReference.length > 0 ? m.nftReference.join(', ') : '-'}</span>, className: 'font-mono text-xs' },
      ]}
      actions={(meta) => ({
        onEdit: () => handleEdit(meta),
        onDelete: () => handleDelete(meta.id),
      })}
      mobileCardTitle={(m) => m.assetName || 'Metadata'}
      mobileCardDescription={(m) => (
        <>
          <p className="text-xs text-muted-foreground break-words">{m.content}</p>
          {m.nftReference && m.nftReference.length > 0 && (
            <p className="text-xs text-muted-foreground break-words">NFT: {m.nftReference.join(', ')}</p>
          )}
        </>
      )}
      emptyMessage="No metadata"
      dialogOpen={open}
      onDialogOpenChange={(open) => {
        setOpen(open)
        if (!open) {
          setEditing(null)
          setSelectedProductId('')
          reset()
        }
      }}
      dialogTrigger={<Button size="sm" onClick={handleCreate} className="w-full sm:w-auto">Add</Button>}
      submitting={loading}
      dialogContent={
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
                  <SelectItem value="__none__">None</SelectItem>
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
      }
    />
  )
}
