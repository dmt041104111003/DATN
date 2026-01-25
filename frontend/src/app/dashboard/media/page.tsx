"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Media } from '@/types/api'
import { useAuth } from '@/contexts/auth-context'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingPage, LoadingOverlay } from '@/components/ui/loading'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ActionsDropdown } from '@/components/ui/actions-dropdown'

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
      const errorMessage = err instanceof Error ? err.message : 'Upload thất bại'
      if (errorMessage.includes('hết hạn')) {
        alert(`${errorMessage}. Vui lòng gia hạn gói dịch vụ để tiếp tục.`)
        router.push('/dashboard/billing')
      } else if (errorMessage.includes('IPFS')) {
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
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const getFileTypeIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type.startsWith('video/')) return '🎥'
    if (type === 'application/pdf') return '📄'
    return ''
  }

  const toGatewayUrl = (ipfsUrl: string): string => {
    if (ipfsUrl.startsWith('ipfs://')) {
      const cid = ipfsUrl.replace('ipfs://', '')
      return `https://gateway.pinata.cloud/ipfs/${cid}`
    }
    return ipfsUrl
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Media</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Manage your media files</p>
        </div>
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
      </div>

      {loading ? (
        <LoadingPage />
      ) : media.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No media files yet</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden md:block border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {media.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{getFileTypeIcon(item.type)}</span>
                        <span>{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>
                      <a
                        href={toGatewayUrl(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-mono text-xs break-all"
                      >
                        {truncateUrl(item.url)}
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <ActionsDropdown
                        onDelete={() => handleDelete(item.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="md:hidden space-y-2">
            {media.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="flex items-start gap-2 min-w-0">
                    <span className="flex-shrink-0 mt-0.5">{getFileTypeIcon(item.type)}</span>
                    <span className="break-words min-w-0 flex-1 overflow-hidden text-ellipsis line-clamp-2">{item.name}</span>
                  </CardTitle>
                  <CardDescription className="mt-1">{item.type}</CardDescription>
                </CardHeader>
                <CardContent>
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
                      <span className="text-muted-foreground">URL: </span>
                      <a
                        href={toGatewayUrl(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-mono text-xs block break-all"
                        style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                      >
                        {item.url}
                      </a>
                    </div>
                    {item.type.startsWith('image/') && (
                      <img
                        src={toGatewayUrl(item.url)}
                        alt={item.name}
                        className="w-full h-32 object-cover rounded mt-2"
                      />
                    )}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="text-destructive hover:text-destructive flex-1"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
