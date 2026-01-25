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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingOverlay } from '@/components/ui/loading'

export function ProductCertifications({ productId, certifications, onRefresh }: { productId: string; certifications: Certification[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset } = useForm<{ certName: string; issueDate: string; expiryDate?: string; certHash?: string }>()

  const onSubmit = async (data: { certName: string; issueDate: string; expiryDate?: string; certHash?: string }) => {
    setLoading(true)
    try {
      await apiClient.certifications.create({ ...data, productId })
      setOpen(false)
      reset()
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create certification')
    } finally {
      setLoading(false)
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
            {loading && <LoadingOverlay />}
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Add Certification</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 px-4 py-4 min-w-0 w-full">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input {...register('certName', { required: true })} placeholder="e.g. ISO 9001, Organic Certification" disabled={loading} />
                </div>
                <div className="grid gap-2">
                  <Label>Issue Date</Label>
                  <Input type="date" {...register('issueDate', { required: true })} disabled={loading} />
                </div>
                <div className="grid gap-2">
                  <Label>Expiry Date (Optional)</Label>
                  <Input type="date" {...register('expiryDate')} disabled={loading} />
                </div>
                <div className="grid gap-2">
                  <Label>Hash (Optional)</Label>
                  <Input {...register('certHash')} placeholder="Certification hash (optional)" disabled={loading} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Add'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {certifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No certifications</p>
        ) : (
          <>
            <div className="hidden md:block border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Hash</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certifications.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">{cert.certName}</TableCell>
                      <TableCell>{new Date(cert.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="font-mono text-xs">{cert.certHash || '-'}</TableCell>
                      <TableCell className="text-right">
                        <ActionsDropdown
                          onDelete={() => handleDelete(cert.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="md:hidden space-y-2">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex flex-col gap-2 p-2 border rounded">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{cert.certName}</p>
                    <p className="text-xs text-muted-foreground break-words">
                      Issued: {new Date(cert.issueDate).toLocaleDateString()}
                      {cert.expiryDate && ` | Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(cert.id)} className="w-full text-destructive hover:text-destructive">Delete</Button>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
