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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ActionsDropdown } from '@/components/ui/actions-dropdown'
import { LoadingOverlay } from '@/components/ui/loading'

export function MaterialSuppliers({ suppliers, onRefresh }: { suppliers: Supplier[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<{ location: string; gpsCoordinates: string } | undefined>()
  const { register, handleSubmit, reset } = useForm<{ name: string; contactInfo?: string }>()

  const onSubmit = async (data: { name: string; contactInfo?: string }) => {
    setLoading(true)
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
    } finally {
      setLoading(false)
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
            {loading && <LoadingOverlay />}
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 px-4 py-4 min-w-0">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input 
                    id="name"
                    {...register('name', { required: true })} 
                    placeholder="e.g. ABC Supplier Co."
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactInfo">Contact Info</Label>
                  <Input 
                    id="contactInfo"
                    {...register('contactInfo')} 
                    placeholder="e.g. +1234567890, email@example.com"
                    disabled={loading}
                  />
                </div>
                <LocationPicker
                  value={location}
                  onChange={setLocation}
                  label="Location"
                  disabled={loading}
                />
                <div className="grid gap-2">
                  <Label htmlFor="gps">GPS Coordinates</Label>
                  <Input 
                    id="gps"
                    value={location?.gpsCoordinates || ''} 
                    readOnly
                    placeholder="Select location on map to get GPS coordinates"
                    className="bg-muted font-mono text-xs"
                    disabled={loading}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Processing...' : editing ? 'Update' : 'Add'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {suppliers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No suppliers</p>
        ) : (
          <>
            <div className="hidden md:block border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>GPS Coordinates</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{supplier.location || '-'}</TableCell>
                      <TableCell className="font-mono text-xs">{supplier.gpsCoordinates || '-'}</TableCell>
                      <TableCell>{supplier.contactInfo || '-'}</TableCell>
                      <TableCell className="text-right">
                        <ActionsDropdown
                          onEdit={() => handleEdit(supplier)}
                          onDelete={() => handleDelete(supplier.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="md:hidden space-y-2">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="flex flex-col gap-2 p-2 border rounded">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{supplier.name}</p>
                    {supplier.location && <p className="text-xs text-muted-foreground break-words">{supplier.location}</p>}
                    {supplier.gpsCoordinates && <p className="text-xs text-muted-foreground font-mono break-words">GPS: {supplier.gpsCoordinates}</p>}
                    {supplier.contactInfo && <p className="text-xs text-muted-foreground break-words">Contact: {supplier.contactInfo}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(supplier)} className="flex-1">Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(supplier.id)} className="flex-1 text-destructive hover:text-destructive">Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
