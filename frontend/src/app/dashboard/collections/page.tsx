"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Collection, Media } from '@/types/api'
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
import { useForm } from 'react-hook-form'
import { cn } from '@/lib/utils'

export default function CollectionsPage() {
  const router = useRouter()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Collection | null>(null)
  const [thumbnailMode, setThumbnailMode] = useState<'manual' | 'select'>('manual')
  const [media, setMedia] = useState<Media[]>([])
  const [selectedMediaId, setSelectedMediaId] = useState<string>('')
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<{
    name: string
    description?: string
    thumbnail?: string
  }>()

  useEffect(() => {
    if (open && thumbnailMode === 'select' && media.length === 0) {
      loadMedia()
    }
  }, [open, thumbnailMode])

  const loadMedia = async () => {
    try {
      const data = await apiClient.media.findAll()
      setMedia(Array.isArray(data) ? data : [])
    } catch {
      setMedia([])
    }
  }

  const getFileTypeIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type.startsWith('video/')) return '🎥'
    if (type === 'application/pdf') return '📄'
    return '📎'
  }

  useEffect(() => {
    loadCollections()
  }, [])

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

  const onSubmit = async (data: { name: string; description?: string; thumbnail?: string }) => {
    let finalThumbnail = data.thumbnail
    if (thumbnailMode === 'select' && selectedMediaId) {
      const selectedMedia = media.find(m => m.id === selectedMediaId)
      if (selectedMedia) {
        finalThumbnail = selectedMedia.url
      }
    }
    try {
      if (editing) {
        await apiClient.collections.update(editing.id, { ...data, thumbnail: finalThumbnail })
      } else {
        await apiClient.collections.create({ ...data, thumbnail: finalThumbnail })
      }
      setOpen(false)
      setEditing(null)
      setThumbnailMode('manual')
      setSelectedMediaId('')
      reset()
      loadCollections()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save collection')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return
    try {
      await apiClient.collections.remove(id)
      loadCollections()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete collection')
    }
  }

  const handleEdit = (collection: Collection) => {
    setEditing(collection)
    reset({
      name: collection.name,
      description: collection.description || '',
      thumbnail: collection.thumbnail || '',
    })
    setOpen(true)
  }

  const handleCreate = () => {
    setEditing(null)
    reset()
    setOpen(true)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Collections</h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Manage product collections</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate} className="w-full sm:w-auto">Create Collection</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>{editing ? 'Edit Collection' : 'Create Collection'}</DialogTitle>
                  <DialogDescription>
                    {editing ? 'Update collection information' : 'Create a new product collection'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Collection Name</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Collection name is required' })}
                      placeholder="e.g. Premium Collection, Limited Edition"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      {...register('description')}
                      placeholder="Collection description..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="thumbnail">Thumbnail URL (Optional)</Label>
                    <div className="flex gap-2 border-b pb-2">
                      <Button
                        type="button"
                        variant={thumbnailMode === 'manual' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => {
                          setThumbnailMode('manual')
                          setSelectedMediaId('')
                          setValue('thumbnail', '')
                        }}
                        className="flex-1"
                      >
                        Enter URL
                      </Button>
                      <Button
                        type="button"
                        variant={thumbnailMode === 'select' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => {
                          setThumbnailMode('select')
                          setValue('thumbnail', '')
                          if (media.length === 0) loadMedia()
                        }}
                        className="flex-1"
                      >
                        Select from Media
                      </Button>
                    </div>
                    {thumbnailMode === 'manual' ? (
                      <Input
                        id="thumbnail"
                        {...register('thumbnail')}
                        placeholder="https://example.com/image.jpg"
                      />
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-2 border rounded p-2">
                        {media.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">No media files available</p>
                        ) : (
                          media.filter(m => m.type.startsWith('image/')).map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setSelectedMediaId(item.id)
                                setValue('thumbnail', item.url)
                              }}
                              className={cn(
                                "w-full text-left p-2 rounded border transition-colors",
                                selectedMediaId === item.id
                                  ? "border-primary bg-accent"
                                  : "border-border hover:bg-accent/50"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span>{getFileTypeIcon(item.type)}</span>
                                <span className="text-sm font-medium truncate flex-1">{item.name}</span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-1">{item.url}</p>
                              {item.type.startsWith('image/') && (
                                <img src={item.url} alt={item.name} className="w-full h-20 object-cover rounded mt-2" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setOpen(false)
                    setThumbnailMode('manual')
                    setSelectedMediaId('')
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="h-4 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : collections.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No collections yet</p>
              <Button className="mt-4" onClick={handleCreate}>Create your first collection</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Card key={collection.id}>
                <CardHeader>
                  <CardTitle>{collection.name}</CardTitle>
                  {collection.description && (
                    <CardDescription>{collection.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/collections/${collection.id}`)}>
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(collection)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(collection.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  )
}
