"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Certification } from '@/types/api'
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

export function ProductCertifications({ productId, certifications, onRefresh }: { productId: string; certifications: Certification[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm<{ certName: string; issueDate: string; expiryDate?: string; certHash?: string }>()

  const onSubmit = async (data: { certName: string; issueDate: string; expiryDate?: string; certHash?: string }) => {
    try {
      await apiClient.certifications.create({ ...data, productId })
      setOpen(false)
      reset()
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create certification')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this certification?')) return
    try {
      await apiClient.certifications.remove(id)
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <CardTitle>Certifications</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">Add</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Add Certification</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input {...register('certName', { required: true })} placeholder="e.g. ISO 9001, Organic Certification" />
                </div>
                <div className="grid gap-2">
                  <Label>Issue Date</Label>
                  <Input type="date" {...register('issueDate', { required: true })} />
                </div>
                <div className="grid gap-2">
                  <Label>Expiry Date (Optional)</Label>
                  <Input type="date" {...register('expiryDate')} />
                </div>
                <div className="grid gap-2">
                  <Label>Hash (Optional)</Label>
                  <Input {...register('certHash')} placeholder="Certification hash (optional)" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Add</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {certifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No certifications</p>
          ) : (
            certifications.map((cert) => (
              <div key={cert.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 border rounded">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{cert.certName}</p>
                  <p className="text-xs text-muted-foreground break-words">
                    Issued: {new Date(cert.issueDate).toLocaleDateString()}
                    {cert.expiryDate && ` | Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(cert.id)} className="w-full sm:w-auto shrink-0">Delete</Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
