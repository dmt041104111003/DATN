"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Media } from '@/types/api'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingPage, LoadingOverlay } from '@/components/ui/loading'

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const batchFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
  }, [])

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
      } else {
        await apiClient.media.uploadBatch(Array.from(files))
      }
      setUploadOpen(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (batchFileInputRef.current) batchFileInputRef.current.value = ''
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to upload')
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
    return '📎'
  }

  if (loading) return <LoadingPage />

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

      {media.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No media files yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>{getFileTypeIcon(item.type)}</span>
                    <span className="truncate">{item.name}</span>
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Type: {item.type}</p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline block truncate"
                  >
                    {item.url}
                  </a>
                  {item.type.startsWith('image/') && (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded mt-2"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
