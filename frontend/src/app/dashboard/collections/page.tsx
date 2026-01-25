"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Collection, Media } from '@/types/api'
import { useAuth } from '@/contexts/auth-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingOverlay, LoadingPage } from '@/components/ui/loading'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/dashboard/page-header'
import { ResponsiveListView } from '@/components/dashboard/responsive-list-view'
import { EmptyState } from '@/components/dashboard/empty-state'
import { useCrud } from '@/hooks/use-crud'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type CollectionFormData = {
  name: string
  description?: string
  thumbnail?: string
}

export default function CollectionsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [collections, setCollections] = useState<Collection[]>([])
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [thumbnailSource, setThumbnailSource] = useState<'media' | 'other'>('media')
  const [selectedMediaId, setSelectedMediaId] = useState<string>('')

  const loadCollections = async () => {
    try {
      const data = await apiClient.collections.findMy()
      setCollections(Array.isArray(data) ? data : [])
    } catch {
      setCollections([])
    } finally {
      setLoading(false)
    }
  }

  const loadMedia = async () => {
    try {
      const data = await apiClient.media.findAll()
      setMedia(Array.isArray(data) ? data : [])
    } catch {
      setMedia([])
    }
  }

  const {
    open,
    submitting,
    editing,
    form,
    setOpen,
    handleCreate,
    handleEdit,
    handleDelete,
    handleClose,
    onSubmit,
  } = useCrud<Collection, CollectionFormData>({
    loadData: loadCollections,
    onCreate: async (data) => {
      await apiClient.collections.create(data)
    },
    onUpdate: async (id, data) => {
      await apiClient.collections.update(id, data)
    },
    onDelete: async (id) => {
      await apiClient.collections.remove(id)
    },
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadCollections()
    loadMedia()
  }, [user, router])

  useEffect(() => {
    if (open && editing) {
      const currentThumbnail = editing.thumbnail || ''
      const mediaItem = media.find(m => m.url === currentThumbnail)
      if (mediaItem) {
        setThumbnailSource('media')
        setSelectedMediaId(mediaItem.id)
        form.setValue('thumbnail', mediaItem.url)
      } else if (currentThumbnail) {
        setThumbnailSource('other')
        setSelectedMediaId('')
        form.setValue('thumbnail', currentThumbnail)
      } else {
        setThumbnailSource('media')
        setSelectedMediaId('')
        form.setValue('thumbnail', '')
      }
    } else if (open && !editing) {
      setThumbnailSource('media')
      setSelectedMediaId('')
      form.setValue('thumbnail', '')
    }
  }, [open, editing, media, form])

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        description: editing.description || '',
        thumbnail: editing.thumbnail || '',
      })
    }
  }, [editing, form])

  const handleThumbnailSourceChange = (source: 'media' | 'other') => {
    setThumbnailSource(source)
    if (source === 'media') {
      setSelectedMediaId('')
      form.setValue('thumbnail', '')
    } else {
      setSelectedMediaId('')
    }
  }

  const handleMediaSelect = (mediaId: string) => {
    setSelectedMediaId(mediaId)
    const selectedMedia = media.find(m => m.id === mediaId)
    if (selectedMedia) {
      form.setValue('thumbnail', selectedMedia.url)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Collections"
        description="Manage product collections"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate} className="w-full sm:w-auto">Create Collection</Button>
            </DialogTrigger>
            <DialogContent>
              {submitting && <LoadingOverlay />}
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>{editing ? 'Edit Collection' : 'Create Collection'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 px-4 py-4 min-w-0 w-full">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Collection Name</Label>
                    <Input
                      id="name"
                      {...form.register('name', { required: 'Collection name is required' })}
                      placeholder="e.g. Premium Collection, Limited Edition"
                      disabled={submitting}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      {...form.register('description')}
                      placeholder="Collection description..."
                      disabled={submitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Thumbnail (Optional)</Label>
                    <Tabs
                      value={thumbnailSource}
                      onValueChange={(value) => handleThumbnailSourceChange(value as 'media' | 'other')}
                    >
                      <TabsList className="w-full">
                        <TabsTrigger value="media" disabled={submitting}>
                          Select from Media
                        </TabsTrigger>
                        <TabsTrigger value="other" disabled={submitting}>
                          Other URL
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    {thumbnailSource === 'media' ? (
                      <Select
                        value={selectedMediaId}
                        onValueChange={handleMediaSelect}
                        disabled={submitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a media file" />
                        </SelectTrigger>
                        <SelectContent>
                          {media.length === 0 ? (
                            <SelectItem value="__no_media__" disabled>No media files available</SelectItem>
                          ) : (
                            media.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="thumbnail"
                        {...form.register('thumbnail')}
                        placeholder="https://example.com/image.jpg"
                        disabled={submitting}
                      />
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Processing...' : editing ? 'Update' : 'Create'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <LoadingPage />
      ) : collections.length === 0 ? (
        <EmptyState
          message="No collections yet"
          action={{
            label: 'Create your first collection',
            onClick: handleCreate,
          }}
        />
      ) : (
        <ResponsiveListView
          items={collections}
          columns={[
            { key: 'name', header: 'Name', render: (c) => <span className="font-medium">{c.name}</span> },
            { key: 'description', header: 'Description', render: (c) => <span className="max-w-[300px] truncate">{c.description || '-'}</span>, className: 'max-w-[300px] truncate' },
          ]}
          actions={(collection) => ({
            viewHref: `/dashboard/collections/${collection.id}`,
            onEdit: () => handleEdit(collection),
            onDelete: () => handleDelete(collection.id, collection),
          })}
          mobileCardTitle={(c) => c.name}
          mobileCardDescription={(c) => c.description || undefined}
        />
      )}
    </div>
  )
}
