"use client"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { SubListCard } from './sub-list-card'
import { handleApiError } from '@/lib/utils/error-handler'
import { toGatewayUrl, GatewayLink } from '@/components/ui/gateway-link'

export function ProductDocuments({ productId, documents, onRefresh }: { productId: string; documents: Document[]; onRefresh: () => void }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null)
  const [editing, setEditing] = useState<Document | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<{ docType: string; url: string; hash?: string }>()

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const media = await apiClient.media.upload(file)
      const gatewayUrl = toGatewayUrl(media.url)
      setValue('url', gatewayUrl)
      setValue('hash', media.id)
      setUploading(false)
      return gatewayUrl
    } catch (err) {
      setUploading(false)
      const errorMessage = handleApiError(err, router)
      throw new Error(errorMessage)
    }
  }

  const onSubmit = async (data: { docType: string; url: string; hash?: string }) => {
    setLoading(true)
    try {
      if (editing) {
        await apiClient.documents.update(editing.id, data)
      } else {
        await apiClient.documents.create({ ...data, productId })
      }
      setOpen(false)
      setEditing(null)
      setUploadMethod('url')
      if (fileInputRef.current) fileInputRef.current.value = ''
      reset()
      onRefresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save document'
      if (errorMessage.includes('hết hạn')) {
        alert(`${errorMessage}. Vui lòng gia hạn gói dịch vụ để tiếp tục.`)
        router.push('/dashboard/billing')
      } else {
        alert(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      await handleFileUpload(file)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'File upload failed')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleEdit = (doc: Document) => {
    setEditing(doc)
    setValue('docType', doc.docType)
    setValue('url', doc.url)
    setValue('hash', doc.hash || '')
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return
    try {
      await apiClient.documents.remove(id)
      onRefresh()
    } catch (err) {
      const errorMessage = handleApiError(err, router)
      alert(errorMessage)
    }
  }

  const handleCreate = () => {
    setEditing(null)
    setUploadMethod('url')
    if (fileInputRef.current) fileInputRef.current.value = ''
    reset()
    setOpen(true)
  }

  const handleView = (doc: Document) => {
    setViewingDoc(doc)
    setViewOpen(true)
  }

  return (
    <SubListCard
      title="Documents"
      items={documents}
      columns={[
        { key: 'docType', header: 'Type', render: (d: Document) => <span className="font-medium">{d.docType}</span> },
        { key: 'url', header: 'URL', render: (d: Document) => (
          <GatewayLink url={d.url} className="block max-w-[300px]" />
        ), className: 'max-w-[300px]' },
        { key: 'hash', header: 'Hash', render: (d: Document) => <span className="font-mono text-xs">{d.hash || '-'}</span>, className: 'font-mono text-xs' },
      ]}
      actions={(doc: Document) => ({
        onView: () => handleView(doc),
        onEdit: () => handleEdit(doc),
        onDelete: () => handleDelete(doc.id),
      })}
      mobileCardTitle={(d: Document) => d.docType}
      mobileCardDescription={(d: Document) => (
        <GatewayLink url={d.url} className="text-xs" />
      )}
      emptyMessage="No documents"
      dialogOpen={open}
      onDialogOpenChange={(open: boolean) => {
        setOpen(open)
        if (!open) {
          setEditing(null)
          setUploadMethod('url')
          if (fileInputRef.current) fileInputRef.current.value = ''
          reset()
        }
      }}
      dialogTrigger={<Button size="sm" onClick={handleCreate} className="w-full sm:w-auto">Add</Button>}
      submitting={loading || uploading}
      viewDialog={
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingDoc?.docType || 'Document Details'}</DialogTitle>
              <DialogDescription>
                View document information and preview
              </DialogDescription>
            </DialogHeader>
            {viewingDoc && (
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm">{viewingDoc.docType}</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">URL</Label>
                  <GatewayLink url={viewingDoc.url} />
                </div>
                {viewingDoc.hash && (
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Hash</Label>
                    <p className="text-sm font-mono break-all">{viewingDoc.hash}</p>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Created At</Label>
                  <p className="text-sm">{new Date(viewingDoc.createdAt).toLocaleString()}</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Updated At</Label>
                  <p className="text-sm">{new Date(viewingDoc.updatedAt).toLocaleString()}</p>
                </div>
                {(viewingDoc.url.endsWith('.pdf') || viewingDoc.url.includes('pdf')) && (
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Preview</Label>
                    <iframe
                      src={toGatewayUrl(viewingDoc.url)}
                      className="w-full h-96 border rounded"
                      title="Document preview"
                    />
                  </div>
                )}
                {(viewingDoc.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || viewingDoc.url.includes('image')) && (
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Preview</Label>
                    <img
                      src={toGatewayUrl(viewingDoc.url)}
                      alt={viewingDoc.docType}
                      className="w-full max-h-96 object-contain border rounded"
                    />
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
              {viewingDoc && (
                <Button asChild>
                  <a href={toGatewayUrl(viewingDoc.url)} target="_blank" rel="noopener noreferrer">
                    Open in New Tab
                  </a>
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
      dialogContent={
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Document' : 'Add Document'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 px-4 py-4 min-w-0 w-full">
            <div className="grid gap-2">
              <Label>Type *</Label>
              <Input 
                {...register('docType', { required: 'Please enter document type' })} 
                placeholder="e.g. Certificate, Invoice, Receipt" 
                disabled={loading || uploading}
              />
              {errors.docType && (
                <p className="text-sm text-destructive">{errors.docType.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Upload Method</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={uploadMethod === 'url' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadMethod('url')}
                  disabled={loading || uploading}
                >
                  URL
                </Button>
                <Button
                  type="button"
                  variant={uploadMethod === 'file' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadMethod('file')}
                  disabled={loading || uploading}
                >
                  Upload File
                </Button>
              </div>
            </div>
            {uploadMethod === 'url' ? (
              <div className="grid gap-2">
                <Label>URL *</Label>
                <Input 
                  {...register('url', { 
                    required: 'Please enter URL or upload file',
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'Invalid URL. Please enter a URL starting with http:// or https://'
                    }
                  })} 
                  placeholder="https://example.com/document.pdf" 
                  disabled={loading || uploading}
                />
                {errors.url && (
                  <p className="text-sm text-destructive">{errors.url.message}</p>
                )}
              </div>
            ) : (
              <div className="grid gap-2">
                <Label>File *</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  disabled={loading || uploading}
                />
                {uploading && (
                  <p className="text-sm text-muted-foreground">Đang upload file...</p>
                )}
                {watch('url') && uploadMethod === 'file' && (
                  <p className="text-sm text-muted-foreground">File đã upload: {watch('url')}</p>
                )}
              </div>
            )}
            <div className="grid gap-2">
              <Label>Hash (Optional)</Label>
              <Input {...register('hash')} placeholder="Document hash (optional)" disabled={loading || uploading} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setOpen(false)
              setEditing(null)
              setUploadMethod('url')
              if (fileInputRef.current) fileInputRef.current.value = ''
              reset()
            }} disabled={loading || uploading}>Cancel</Button>
            <Button type="submit" disabled={loading || uploading}>{loading || uploading ? 'Processing...' : editing ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </form>
      }
    />
  )
}
