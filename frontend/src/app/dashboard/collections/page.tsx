"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useForm } from 'react-hook-form'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ActionsDropdown } from '@/components/ui/actions-dropdown'
import { LoadingOverlay, LoadingPage } from '@/components/ui/loading'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function CollectionsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [collections, setCollections] = useState<Collection[]>([])
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Collection | null>(null)
  const [thumbnailSource, setThumbnailSource] = useState<'media' | 'other'>('media')
  const [selectedMediaId, setSelectedMediaId] = useState<string>('')
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<{
    name: string
    description?: string
    thumbnail?: string
  }>()

  const thumbnailValue = watch('thumbnail')

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
        setValue('thumbnail', mediaItem.url)
      } else if (currentThumbnail) {
        setThumbnailSource('other')
        setSelectedMediaId('')
        setValue('thumbnail', currentThumbnail)
      } else {
        setThumbnailSource('media')
        setSelectedMediaId('')
        setValue('thumbnail', '')
      }
    } else if (open && !editing) {
      setThumbnailSource('media')
      setSelectedMediaId('')
      setValue('thumbnail', '')
    }
  }, [open, editing, media, setValue])

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

  const toGatewayUrl = (ipfsUrl: string): string => {
    if (ipfsUrl.startsWith('ipfs://')) {
      const cid = ipfsUrl.replace('ipfs://', '')
      return `https://gateway.pinata.cloud/ipfs/${cid}`
    }
    return ipfsUrl
  }

  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (data: { name: string; description?: string; thumbnail?: string }) => {
    setSubmitting(true)
    try {
      if (editing) {
        await apiClient.collections.update(editing.id, data)
      } else {
        await apiClient.collections.create(data)
      }
      setOpen(false)
      setEditing(null)
      reset()
      loadCollections()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save collection')
    } finally {
      setSubmitting(false)
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
    setThumbnailSource('media')
    setSelectedMediaId('')
    reset()
    setOpen(true)
  }

  const handleThumbnailSourceChange = (source: 'media' | 'other') => {
    setThumbnailSource(source)
    if (source === 'media') {
      setSelectedMediaId('')
      setValue('thumbnail', '')
    } else {
      setSelectedMediaId('')
    }
  }

  const handleMediaSelect = (mediaId: string) => {
    setSelectedMediaId(mediaId)
    const selectedMedia = media.find(m => m.id === mediaId)
    if (selectedMedia) {
      setValue('thumbnail', selectedMedia.url)
    }
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
              {submitting && <LoadingOverlay />}
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>{editing ? 'Edit Collection' : 'Create Collection'}</DialogTitle>
                  <DialogDescription>
                    {editing ? 'Update collection information' : 'Create a new product collection'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 px-4 py-4 min-w-0 w-full">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Collection Name</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Collection name is required' })}
                      placeholder="e.g. Premium Collection, Limited Edition"
                      disabled={submitting}
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
                      disabled={submitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Thumbnail (Optional)</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={thumbnailSource === 'media' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleThumbnailSourceChange('media')}
                        disabled={submitting}
                        className="flex-1"
                      >
                        Select from Media
                      </Button>
                      <Button
                        type="button"
                        variant={thumbnailSource === 'other' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleThumbnailSourceChange('other')}
                        disabled={submitting}
                        className="flex-1"
                      >
                        Other URL
                      </Button>
                    </div>
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
                            <SelectItem value="" disabled>No media files available</SelectItem>
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
                        {...register('thumbnail')}
                        placeholder="https://example.com/image.jpg"
                        disabled={submitting}
                      />
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Processing...' : editing ? 'Update' : 'Create'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <LoadingPage />
        ) : collections.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No collections yet</p>
              <Button className="mt-4" onClick={handleCreate}>Create your first collection</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="hidden md:block border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collections.map((collection) => (
                    <TableRow key={collection.id}>
                      <TableCell className="font-medium">{collection.name}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{collection.description || '-'}</TableCell>
                      <TableCell className="text-right">
                        <ActionsDropdown
                          viewHref={`/dashboard/collections/${collection.id}`}
                          onEdit={() => handleEdit(collection)}
                          onDelete={() => handleDelete(collection.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="md:hidden space-y-2">
              {collections.map((collection) => (
                <Card key={collection.id}>
                  <CardHeader>
                    <CardTitle>{collection.name}</CardTitle>
                    {collection.description && (
                      <CardDescription>{collection.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/collections/${collection.id}`)} className="flex-1">
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(collection)} className="flex-1">
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(collection.id)}
                        className="text-destructive hover:text-destructive flex-1"
                      >
                        Delete
                      </Button>
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
