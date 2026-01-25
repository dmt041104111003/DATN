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

export function CollectionMetadata({ collectionId, metadata, onRefresh }: { collectionId: string; metadata: Metadata[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset } = useForm<{ assetName?: string; content: string; nftReference?: string }>()

  const onSubmit = async (data: { assetName?: string; content: string; nftReference?: string }) => {
    setLoading(true)
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
    } finally {
      setLoading(false)
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
            {loading && <LoadingOverlay />}
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Add Metadata</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 px-4 py-4 min-w-0 w-full">
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
                  <Input {...register('nftReference')} placeholder="NFT reference ID" disabled={loading} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Add'}</Button>
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
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(meta.id)} className="w-full text-destructive hover:text-destructive">Delete</Button>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
