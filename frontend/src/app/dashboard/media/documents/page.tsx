"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Document, Product } from '@/types/api'
import { useAuth } from '@/contexts/auth-context'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingPage, LoadingOverlay } from '@/components/ui/loading'
import { PageHeader } from '@/components/dashboard/shared/page-header'
import { ResponsiveListView } from '@/components/dashboard/shared/responsive-list-view'
import { handleApiError } from '@/lib/utils/error-handler'
import { showAlert } from '@/lib/utils/alert'
import { confirm } from '@/lib/utils/confirm'
import { EmptyState } from '@/components/dashboard/shared/empty-state'
import { toGatewayUrl, GatewayLink } from '@/components/ui/gateway-link'
import { useForm } from 'react-hook-form'
import Link from 'next/link'

export default function DocumentsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [docOpen, setDocOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Document | null>(null)
  const [docLoading, setDocLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url')
  const docFileInputRef = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<{ productId: string; docType: string; url: string; hash?: string }>()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadData()
    loadProducts()
  }, [user, router])

  const loadData = async () => {
    try {
      const data = await apiClient.documents.findAll()
      setDocuments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const data = await apiClient.products.findMy()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load products:', err)
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const media = await apiClient.media.upload(file)
      const gatewayUrl = toGatewayUrl(media.url)
      setValue('url', gatewayUrl)
      setValue('hash', media.id)
      setUploading(false)
    } catch (err) {
      setUploading(false)
      const errorMessage = handleApiError(err, router)
      throw new Error(errorMessage)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await handleFileUpload(file)
    } catch (err) {
      showAlert({ description: err instanceof Error ? err.message : 'File upload failed', variant: 'error' })
      if (docFileInputRef.current) docFileInputRef.current.value = ''
    }
  }

  const onSubmitDoc = async (data: { productId: string; docType: string; url: string; hash?: string }) => {
    if (!data.productId) {
      showAlert({ description: 'Please select a product', variant: 'error' })
      return
    }
    setDocLoading(true)
    try {
      if (editingDoc) {
        await apiClient.documents.update(editingDoc.id, data)
      } else {
        await apiClient.documents.create(data)
      }
      setDocOpen(false)
      setEditingDoc(null)
      setUploadMethod('url')
      if (docFileInputRef.current) docFileInputRef.current.value = ''
      reset()
      loadData()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save document'
      if (errorMessage.includes('expired') || errorMessage.includes('Subscription')) {
        showAlert({ description: `${errorMessage}. Please renew your subscription to continue.`, variant: 'warning' })
        router.push('/dashboard/billing/services')
      } else {
        showAlert({ description: errorMessage, variant: 'error' })
      }
    } finally {
      setDocLoading(false)
    }
  }

  const handleDeleteDoc = async (id: string) => {
    if (!(await confirm('Delete this document?'))) return
    try {
      await apiClient.documents.remove(id)
      loadData()
    } catch (err) {
      const errorMessage = handleApiError(err, router)
      showAlert({ description: errorMessage, variant: 'error' })
    }
  }

  const handleEditDoc = (doc: Document) => {
    setEditingDoc(doc)
    setValue('productId', doc.productId)
    setValue('docType', doc.docType)
    setValue('url', doc.url)
    setValue('hash', doc.hash || '')
    setDocOpen(true)
  }

  const handleCreateDoc = () => {
    setEditingDoc(null)
    setUploadMethod('url')
    if (docFileInputRef.current) docFileInputRef.current.value = ''
    reset()
    setDocOpen(true)
  }

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId)
    return product?.name || 'Unknown Product'
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Media & Documents"
        description="Manage your media files and documents"
      />

      <Tabs value="documents" onValueChange={(value) => {
        if (value === 'files') {
          router.push('/dashboard/media/files')
        }
      }}>
        <TabsList>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex justify-end mb-4">
        <Dialog open={docOpen} onOpenChange={setDocOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateDoc} className="w-full sm:w-auto">Add Document</Button>
          </DialogTrigger>
          <DialogContent>
            {docLoading && <LoadingOverlay />}
            <form onSubmit={handleSubmit(onSubmitDoc)}>
              <DialogHeader>
                <DialogTitle>{editingDoc ? 'Edit Document' : 'Add Document'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 px-4 py-4 min-w-0 w-full">
                <div className="grid gap-2">
                  <Label>Type *</Label>
                  <Input 
                    {...register('docType', { required: 'Please enter document type' })} 
                    placeholder="e.g. Certificate, Invoice, Receipt" 
                    disabled={docLoading || uploading}
                  />
                  {errors.docType && (
                    <p className="text-sm text-destructive">{errors.docType.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Upload Method</Label>
                  <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as 'url' | 'file')}>
                    <TabsList>
                      <TabsTrigger value="url" disabled={docLoading || uploading}>
                        URL
                      </TabsTrigger>
                      <TabsTrigger value="file" disabled={docLoading || uploading}>
                        Upload File
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
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
                      disabled={docLoading || uploading}
                    />
                    {errors.url && (
                      <p className="text-sm text-destructive">{errors.url.message}</p>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Label>File *</Label>
                    <Input
                      ref={docFileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      disabled={docLoading || uploading}
                    />
                    {uploading && (
                      <p className="text-sm text-muted-foreground">Uploading file...</p>
                    )}
                    {watch('url') && uploadMethod === 'file' && (
                      <p className="text-sm text-muted-foreground">File uploaded: {watch('url')}</p>
                    )}
                  </div>
                )}
                <div className="grid gap-2">
                  <Label>Hash (Optional)</Label>
                  <Input {...register('hash')} placeholder="Document hash (optional)" disabled={docLoading || uploading} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setDocOpen(false)
                  setEditingDoc(null)
                  setUploadMethod('url')
                  if (docFileInputRef.current) docFileInputRef.current.value = ''
                  reset()
                }} disabled={docLoading || uploading}>Cancel</Button>
                <Button type="submit" disabled={docLoading || uploading}>{docLoading || uploading ? 'Processing...' : editingDoc ? 'Update' : 'Add'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <LoadingPage />
      ) : documents.length === 0 ? (
        <EmptyState message="No documents yet" />
      ) : (
        <ResponsiveListView
          items={documents}
          columns={[
            { key: 'docType', header: 'Type', render: (d: Document) => <span className="font-medium">{d.docType}</span> },
            { key: 'url', header: 'URL', render: (d: Document) => (
              <GatewayLink url={d.url} className="block max-w-[300px]" />
            ), className: 'max-w-[300px]' },
            { key: 'hash', header: 'Hash', render: (d: Document) => <span className="font-mono text-xs">{d.hash || '-'}</span>, className: 'font-mono text-xs' },
          ]}
          actions={(doc: Document) => ({
            onEdit: () => handleEditDoc(doc),
            onDelete: () => handleDeleteDoc(doc.id),
          })}
          mobileCardTitle={(d: Document) => d.docType}
          mobileCardDescription={(d: Document) => (
            <GatewayLink url={d.url} className="text-xs" />
          )}
        />
      )}
    </div>
  )
}
