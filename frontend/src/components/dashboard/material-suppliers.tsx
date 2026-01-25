"use client"

import { useState } from 'react'
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
import { LoadingOverlay } from '@/components/ui/loading'
import { ResponsiveListView } from './responsive-list-view'
import { handleApiError } from '@/lib/utils/error-handler'

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
      const errorMessage = handleApiError(err)
      alert(errorMessage)
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
      const errorMessage = handleApiError(err)
      alert(errorMessage)
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-xl font-semibold">Suppliers</h2>
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
      </div>

      {suppliers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No suppliers</p>
      ) : (
        <ResponsiveListView
          items={suppliers}
          columns={[
            { key: 'name', header: 'Name', render: (s) => <span className="font-medium">{s.name}</span> },
            { key: 'location', header: 'Location', render: (s) => <span className="max-w-[200px] truncate">{s.location || '-'}</span>, className: 'max-w-[200px] truncate' },
            { key: 'gpsCoordinates', header: 'GPS Coordinates', render: (s) => <span className="font-mono text-xs">{s.gpsCoordinates || '-'}</span>, className: 'font-mono text-xs' },
            { key: 'contactInfo', header: 'Contact', render: (s) => s.contactInfo || '-' },
          ]}
          actions={(supplier) => ({
            onEdit: () => handleEdit(supplier),
            onDelete: () => handleDelete(supplier.id),
          })}
          mobileCardTitle={(s) => s.name}
          mobileCardDescription={(s) => (
            <>
              {s.location && <p className="text-xs text-muted-foreground break-words">{s.location}</p>}
              {s.gpsCoordinates && <p className="text-xs text-muted-foreground font-mono break-words">GPS: {s.gpsCoordinates}</p>}
              {s.contactInfo && <p className="text-xs text-muted-foreground break-words">Contact: {s.contactInfo}</p>}
            </>
          )}
        />
      )}
    </div>
  )
}
