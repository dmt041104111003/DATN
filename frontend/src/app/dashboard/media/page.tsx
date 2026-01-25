"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Media } from '@/types/api'
import { useAuth } from '@/contexts/auth-context'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingPage, LoadingOverlay } from '@/components/ui/loading'
import { PageHeader } from '@/components/dashboard/page-header'
import { ResponsiveListView } from '@/components/dashboard/responsive-list-view'
import { handleApiError } from '@/lib/utils/error-handler'
import { EmptyState } from '@/components/dashboard/empty-state'
import { toGatewayUrl, GatewayLink } from '@/components/ui/gateway-link'
export default function MediaPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const batchFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadData()
  }, [user, router])

  const loadData = async () => {
    try {
      const data = await apiClient.media.findAll()
      setMedia(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    setUploading(true)
    try {
      if (files.length === 1) {
        await apiClient.media.upload(files[0])
        alert('Upload thành công!')
      } else {
        const result = await apiClient.media.uploadBatch(Array.from(files))
        if (result.failed > 0) {
          alert(`Upload hoàn tất: ${result.successful.length}/${result.total} file thành công. ${result.failed} file thất bại.`)
        } else {
          alert(`Upload thành công ${result.total} file!`)
        }
      }
      setUploadOpen(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (batchFileInputRef.current) batchFileInputRef.current.value = ''
      loadData()
    } catch (err) {
      const errorMessage = handleApiError(err, router)
      if (errorMessage.includes('IPFS')) {
        alert(`${errorMessage}. Vui lòng thử lại sau hoặc liên hệ hỗ trợ kỹ thuật.`)
      } else {
        alert(errorMessage)
      }
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this media?')) return
    try {
      await apiClient.media.remove(id)
      loadData()
    } catch (err) {
      const errorMessage = handleApiError(err, router)
      alert(errorMessage)
    }
  }

  const getFileTypeIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type.startsWith('video/')) return '🎥'
    if (type === 'application/pdf') return '📄'
    return ''
  }


  const getCidFromUrl = (url: string): string => {
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', '')
    }
    return ''
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const truncateUrl = (url: string, maxLength: number = 40) => {
    if (url.length <= maxLength) return url
    return url.slice(0, maxLength) + '...'
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Media"
        description="Manage your media files"
        action={
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">Upload</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Media</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 px-4 py-4 min-w-0 w-full">
                <div className="grid gap-2">
                  <Label>Single File</Label>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => handleUpload(e.target.files)}
                    disabled={uploading}
                    accept="image/*,video/*,application/pdf"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Multiple Files (up to 10)</Label>
                  <Input
                    ref={batchFileInputRef}
                    type="file"
                    multiple
                    onChange={(e) => handleUpload(e.target.files)}
                    disabled={uploading}
                    accept="image/*,video/*,application/pdf"
                  />
                </div>
                {uploading && <LoadingOverlay text="Uploading..." />}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadOpen(false)} disabled={uploading}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <LoadingPage />
      ) : media.length === 0 ? (
        <EmptyState message="No media files yet" />
      ) : (
        <ResponsiveListView
          items={media}
          columns={[
            { key: 'name', header: 'Name', render: (item) => (
              <div className="flex items-center gap-2">
                <span>{getFileTypeIcon(item.type)}</span>
                <span className="font-medium">{item.name}</span>
              </div>
            )},
            { key: 'type', header: 'Type', render: (item) => item.type },
            { key: 'url', header: 'URL', render: (item) => (
              <GatewayLink url={item.url} className="block max-w-[300px]" />
            )},
          ]}
          actions={(item) => ({
            onDelete: () => handleDelete(item.id),
          })}
          mobileCardTitle={(item) => (
            <div className="flex items-start gap-2 min-w-0">
              <span className="flex-shrink-0 mt-0.5">{getFileTypeIcon(item.type)}</span>
              <span className="break-words min-w-0 flex-1 overflow-hidden text-ellipsis line-clamp-2">{item.name}</span>
            </div>
          )}
          mobileCardDescription={(item) => item.type}
          mobileCardContent={(item) => (
            <div className="space-y-2 text-sm">
              {getCidFromUrl(item.url) && (
                <div>
                  <span className="text-muted-foreground">CID: </span>
                  <span className="font-mono text-xs break-all">{getCidFromUrl(item.url)}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Upload Date: </span>
                <span>{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <div className="break-words overflow-hidden w-full">
                <span className="text-muted-foreground mb-2 block">URL: </span>
                <GatewayLink url={item.url} className="mt-0" />
              </div>
              {item.type.startsWith('image/') && (
                <img
                  src={toGatewayUrl(item.url)}
                  alt={item.name}
                  className="w-full h-32 object-cover rounded mt-2"
                />
              )}
            </div>
          )}
        />
      )}
    </div>
  )
}
