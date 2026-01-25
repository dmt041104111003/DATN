"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Warehouse } from '@/types/api'
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

export default function WarehousesPage() {
  const router = useRouter()
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Warehouse | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    name: string
    location?: string
    capacity?: number
  }>()

  useEffect(() => {
    loadWarehouses()
  }, [])

  const loadWarehouses = async () => {
    try {
      const data = await apiClient.warehouses.findAll()
      setWarehouses(Array.isArray(data) ? data : [])
    } catch {
      setWarehouses([])
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: { name: string; location?: string; capacity?: number }) => {
    setSubmitting(true)
    try {
      if (editing) {
        await apiClient.warehouses.update(editing.id, data)
      } else {
        await apiClient.warehouses.create(data)
      }
      setOpen(false)
      setEditing(null)
      reset()
      loadWarehouses()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save warehouse')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return
    try {
      await apiClient.warehouses.remove(id)
      loadWarehouses()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete warehouse')
    }
  }

  const handleEdit = (warehouse: Warehouse) => {
    setEditing(warehouse)
    reset({
      name: warehouse.name,
      location: warehouse.location || '',
      capacity: warehouse.capacity,
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
            <h1 className="text-2xl sm:text-3xl font-bold">Warehouses</h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Manage storage facilities</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate} className="w-full sm:w-auto">Add more</Button>
            </DialogTrigger>
            <DialogContent>
              {submitting && <LoadingOverlay />}
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>{editing ? 'Edit Warehouse' : 'Create Warehouse'}</DialogTitle>
                  <DialogDescription>
                    {editing ? 'Update warehouse information' : 'Add a new storage facility'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 px-4 py-4 min-w-0 w-full">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Warehouse Name</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Warehouse name is required' })}
                      placeholder="e.g. Main Warehouse, Storage Facility A"
                      disabled={submitting}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location (Optional)</Label>
                    <Input
                      id="location"
                      {...register('location')}
                      placeholder="e.g. 123 Main St, City, Country"
                      disabled={submitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="capacity">Capacity (Optional)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      {...register('capacity', { valueAsNumber: true })}
                      placeholder="e.g. 1000"
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
        ) : warehouses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No warehouses yet</p>
                <div className="flex justify-center mt-4">
                  <Button onClick={handleCreate}>Add first</Button>
                </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="hidden md:block border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouses.map((warehouse) => (
                    <TableRow key={warehouse.id}>
                      <TableCell className="font-medium">{warehouse.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{warehouse.location || '-'}</TableCell>
                      <TableCell>{warehouse.capacity || '-'}</TableCell>
                      <TableCell className="text-right">
                        <ActionsDropdown
                          viewHref={`/dashboard/warehouses/${warehouse.id}`}
                          onEdit={() => handleEdit(warehouse)}
                          onDelete={() => handleDelete(warehouse.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="md:hidden space-y-2">
              {warehouses.map((warehouse) => (
                <Card key={warehouse.id}>
                  <CardHeader>
                    <CardTitle>{warehouse.name}</CardTitle>
                    {warehouse.location && (
                      <CardDescription>{warehouse.location}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Capacity: </span>
                        <span>{warehouse.capacity || '-'}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/warehouses/${warehouse.id}`)} className="flex-1">
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(warehouse)} className="flex-1">
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(warehouse.id)}
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
