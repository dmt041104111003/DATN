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
import { useForm } from 'react-hook-form'

export function MaterialSuppliers({ suppliers, onRefresh }: { suppliers: Supplier[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const { register, handleSubmit, reset } = useForm<{ name: string; contact?: string; address?: string }>()

  const onSubmit = async (data: { name: string; contact?: string; address?: string }) => {
    try {
      if (editing) {
        await apiClient.suppliers.update(editing.id, data)
      } else {
        await apiClient.suppliers.create(data)
      }
      setOpen(false)
      setEditing(null)
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
      contact: supplier.contact || '',
      address: supplier.address || '',
    })
    setOpen(true)
  }

  const handleCreate = () => {
    setEditing(null)
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
                  <Label>Name</Label>
                  <Input {...register('name', { required: true })} placeholder="e.g. ABC Supplier Co." />
                </div>
                <div className="grid gap-2">
                  <Label>Contact (Optional)</Label>
                  <Input {...register('contact')} placeholder="e.g. +1234567890, email@example.com" />
                </div>
                <div className="grid gap-2">
                  <Label>Address (Optional)</Label>
                  <Input {...register('address')} placeholder="e.g. 123 Main St, City, Country" />
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
                  {supplier.contact && <p className="text-xs text-muted-foreground break-words">Contact: {supplier.contact}</p>}
                  {supplier.address && <p className="text-xs text-muted-foreground break-words">{supplier.address}</p>}
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
