"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Document } from '@/types/api'
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

export function ProductDocuments({ productId, documents, onRefresh }: { productId: string; documents: Document[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm<{ docType: string; url: string; hash?: string }>()

  const onSubmit = async (data: { docType: string; url: string; hash?: string }) => {
    try {
      await apiClient.documents.create({ ...data, productId })
      setOpen(false)
      reset()
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create document')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return
    try {
      await apiClient.documents.remove(id)
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <CardTitle>Documents</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">Add</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Add Document</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Input {...register('docType', { required: true })} placeholder="e.g. Certificate, Invoice, Receipt" />
                </div>
                <div className="grid gap-2">
                  <Label>URL</Label>
                  <Input {...register('url', { required: true })} placeholder="https://example.com/document.pdf" />
                </div>
                <div className="grid gap-2">
                  <Label>Hash (Optional)</Label>
                  <Input {...register('hash')} placeholder="Document hash (optional)" />
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
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents</p>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 border rounded">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.docType}</p>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline break-all">
                    View
                  </a>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)} className="w-full sm:w-auto shrink-0">Delete</Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
