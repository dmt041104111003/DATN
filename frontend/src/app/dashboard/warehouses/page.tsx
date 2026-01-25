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

export default function WarehousesPage() {
  const router = useRouter()
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
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
              <Button onClick={handleCreate} className="w-full sm:w-auto">Add Warehouse</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>{editing ? 'Edit Warehouse' : 'Create Warehouse'}</DialogTitle>
                  <DialogDescription>
                    {editing ? 'Update warehouse information' : 'Add a new storage facility'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Warehouse Name</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Warehouse name is required' })}
                      placeholder="e.g. Main Warehouse, Storage Facility A"
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
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="capacity">Capacity (Optional)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      {...register('capacity', { valueAsNumber: true })}
                      placeholder="e.g. 1000"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
        ) : warehouses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No warehouses yet</p>
              <Button className="mt-4" onClick={handleCreate}>Add your first warehouse</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                      <span>{warehouse.capacity}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/warehouses/${warehouse.id}`)}>
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(warehouse)}>
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(warehouse.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  )
}
