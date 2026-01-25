"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Collection } from '@/types/api'
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

export default function CollectionsPage() {
  const router = useRouter()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Collection | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    name: string
    description?: string
    thumbnail?: string
  }>()


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
                    <Label htmlFor="thumbnail">Thumbnail URL (Optional)</Label>
                    <Input
                      id="thumbnail"
                      {...register('thumbnail')}
                      placeholder="https://example.com/image.jpg"
                      disabled={submitting}
                    />
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
