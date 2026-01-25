"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Metadata } from '@/types/api'
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

export function CollectionMetadata({ collectionId, metadata, onRefresh }: { collectionId: string; metadata: Metadata[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm<{ assetName?: string; content: string; nftReference?: string }>()

  const onSubmit = async (data: { assetName?: string; content: string; nftReference?: string }) => {
    try {
      await apiClient.metadata.create({
        collectionId,
        assetName: data.assetName,
        content: data.content,
        nftReference: data.nftReference ? [data.nftReference] : undefined,
      })
      setOpen(false)
      reset()
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create metadata')
    }
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

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <CardTitle>Metadata</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">Add</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Add Metadata</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Asset Name (Optional)</Label>
                  <Input {...register('assetName')} placeholder="e.g. NFT-001" />
                </div>
                <div className="grid gap-2">
                  <Label>Content</Label>
                  <Input {...register('content', { required: true })} placeholder="Metadata content..." />
                </div>
                <div className="grid gap-2">
                  <Label>NFT Reference (Optional)</Label>
                  <Input {...register('nftReference')} placeholder="NFT reference ID" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Add</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {metadata.length === 0 ? (
            <p className="text-sm text-muted-foreground">No metadata</p>
          ) : (
            metadata.map((meta) => (
              <div key={meta.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 border rounded">
                <div className="flex-1 min-w-0">
                  {meta.assetName && <p className="font-medium text-sm truncate">{meta.assetName}</p>}
                  <p className="text-xs text-muted-foreground break-words">{meta.content}</p>
                  {meta.nftReference && meta.nftReference.length > 0 && (
                    <p className="text-xs text-muted-foreground break-words">NFT: {meta.nftReference.join(', ')}</p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(meta.id)} className="w-full sm:w-auto shrink-0">Delete</Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
