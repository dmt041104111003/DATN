"use client"

import { useMedia } from '@/hooks/useMedia'
import { LoadingPage, LoadingOverlay } from '@/components/ui/loading'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MediaTable } from './table'

export function List() {
  const {
    items: media,
    loading,
    uploadOpen,
    uploading,
    fileInputRef,
    batchFileInputRef,
    setUploadOpen,
    handleUpload,
    handleDelete,
  } = useMedia()

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media Files</h1>
          <p className="text-muted-foreground">Manage your media files</p>
        </div>
        <div className="flex justify-end sm:justify-end">
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">Upload</Button>
          </DialogTrigger>
          <DialogContent>
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
      </div>

      {media.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Image
            src="/404.png"
            alt="404"
            height={500}
            width={750}
            className="mx-auto opacity-80"
          />
          <p className="-mt-2 text-xl text-muted-foreground">No media files found</p>
        </div>
      ) : (
        <MediaTable
          media={media}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
