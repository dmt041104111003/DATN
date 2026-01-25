"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Supplier } from '@/types/api'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LocationPicker } from '@/components/ui/location-picker'
import { useForm } from 'react-hook-form'

export function MaterialSuppliers({ suppliers, onRefresh }: { suppliers: Supplier[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [location, setLocation] = useState<{ location: string; gpsCoordinates: string } | undefined>()
  const { register, handleSubmit, reset } = useForm<{ name: string; contactInfo?: string }>()

  const onSubmit = async (data: { name: string; contactInfo?: string }) => {
    try {
      const payload = {
        name: data.name,
        contactInfo: data.contactInfo,
        location: location?.location,
        gpsCoordinates: location?.gpsCoordinates,
      }
      if (editing) {
        await apiClient.suppliers.update(editing.id, payload)
      } else {
        await apiClient.suppliers.create(payload)
      }
      setOpen(false)
      setEditing(null)
      setLocation(undefined)
      reset()
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save supplier')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this supplier?')) return
    try {
      await apiClient.suppliers.remove(id)
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const handleEdit = (supplier: Supplier) => {
    setEditing(supplier)
    reset({
      name: supplier.name,
      contactInfo: supplier.contactInfo || '',
    })
    setLocation({
      location: supplier.location || '',
      gpsCoordinates: supplier.gpsCoordinates || '',
    })
    setOpen(true)
  }

  const handleCreate = () => {
    setEditing(null)
    setLocation(undefined)
    reset()
    setOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <CardTitle>Suppliers</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={handleCreate} className="w-full sm:w-auto">Add</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input 
                    id="name"
                    {...register('name', { required: true })} 
                    placeholder="e.g. ABC Supplier Co." 
                  />
                </div>
                <LocationPicker
                  value={location}
                  onChange={setLocation}
                  label="Location"
                />
                <div className="grid gap-2">
                  <Label htmlFor="gps">GPS Coordinates</Label>
                  <Input 
                    id="gps"
                    value={location?.gpsCoordinates || ''} 
                    readOnly
                    placeholder="Select location on map to get GPS coordinates"
                    className="bg-muted font-mono text-xs"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactInfo">Contact Info</Label>
                  <Input 
                    id="contactInfo"
                    {...register('contactInfo')} 
                    placeholder="e.g. +1234567890, email@example.com" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">{editing ? 'Update' : 'Add'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {suppliers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No suppliers</p>
          ) : (
            suppliers.map((supplier) => (
              <div key={supplier.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 border rounded">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{supplier.name}</p>
                  {supplier.location && <p className="text-xs text-muted-foreground break-words">{supplier.location}</p>}
                  {supplier.gpsCoordinates && <p className="text-xs text-muted-foreground font-mono break-words">GPS: {supplier.gpsCoordinates}</p>}
                  {supplier.contactInfo && <p className="text-xs text-muted-foreground break-words">Contact: {supplier.contactInfo}</p>}
                </div>
                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(supplier)} className="flex-1 sm:flex-initial">Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(supplier.id)} className="flex-1 sm:flex-initial">Delete</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
