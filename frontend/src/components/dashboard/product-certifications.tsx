"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  DialogDescription,
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
import { ActionsDropdown } from '@/components/ui/actions-dropdown'
import { StatusBadge } from '@/components/ui/status-badge'

export function ProductCertifications({ productId, certifications, onRefresh }: { productId: string; certifications: Certification[]; onRefresh: () => void }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewingCert, setViewingCert] = useState<Certification | null>(null)
  const [editing, setEditing] = useState<Certification | null>(null)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<{ certName: string; issueDate: string; expiryDate?: string; certHash?: string }>()

  const getCertStatus = (cert: Certification): 'active' | 'expired' | 'no-expiry' => {
    if (!cert.expiryDate) return 'no-expiry'
    const now = new Date()
    const expiry = new Date(cert.expiryDate)
    return expiry < now ? 'expired' : 'active'
  }

  const validateExpiryDate = (expiryDate: string | undefined, issueDate: string): boolean => {
    if (!expiryDate) return true
    return new Date(expiryDate) > new Date(issueDate)
  }

  const onSubmit = async (data: { certName: string; issueDate: string; expiryDate?: string; certHash?: string }) => {
    if (data.expiryDate && !validateExpiryDate(data.expiryDate, data.issueDate)) {
      alert('Expiry date must be after issue date')
      return
    }
    
    setLoading(true)
    try {
      if (editing) {
        await apiClient.certifications.update(editing.id, data)
      } else {
        await apiClient.certifications.create({ ...data, productId })
      }
      setOpen(false)
      setEditing(null)
      reset()
      onRefresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save certification'
      if (errorMessage.includes('expired') || errorMessage.includes('Subscription')) {
        alert(`${errorMessage}. Please renew your subscription to continue.`)
        router.push('/dashboard/billing')
      } else if (errorMessage.includes('Expiry date')) {
        alert(errorMessage)
      } else {
        alert(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (cert: Certification) => {
    setEditing(cert)
    setValue('certName', cert.certName)
    setValue('issueDate', cert.issueDate.split('T')[0])
    setValue('expiryDate', cert.expiryDate ? cert.expiryDate.split('T')[0] : '')
    setValue('certHash', cert.certHash || '')
    setOpen(true)
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

  const handleCreate = () => {
    setEditing(null)
    reset()
    setOpen(true)
  }

  const handleView = (cert: Certification) => {
    setViewingCert(cert)
    setViewOpen(true)
  }

  const issueDate = watch('issueDate')
  const expiryDate = watch('expiryDate')

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <CardTitle>Certifications</CardTitle>
        <Dialog open={open} onOpenChange={(open) => {
          setOpen(open)
          if (!open) {
            setEditing(null)
            reset()
          }
        }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={handleCreate} className="w-full sm:w-auto">Add</Button>
          </DialogTrigger>
          <DialogContent>
            {loading && <LoadingOverlay />}
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Certification' : 'Add Certification'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 px-4 py-4 min-w-0 w-full">
                <div className="grid gap-2">
                  <Label>Name *</Label>
                  <Input 
                    {...register('certName', { required: 'Vui lòng nhập tên chứng nhận' })} 
                    placeholder="e.g. ISO 9001, Organic Certification" 
                    disabled={loading}
                  />
                  {errors.certName && (
                    <p className="text-sm text-destructive">{errors.certName.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Issue Date *</Label>
                  <Input 
                    type="date" 
                    {...register('issueDate', { required: 'Please select issue date' })} 
                    disabled={loading}
                  />
                  {errors.issueDate && (
                    <p className="text-sm text-destructive">{errors.issueDate.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Expiry Date (Optional)</Label>
                  <Input 
                    type="date" 
                    {...register('expiryDate', {
                      validate: (value) => {
                        if (!value) return true
                        if (!issueDate) return true
                        if (new Date(value) <= new Date(issueDate)) {
                          return 'Expiry date must be after issue date'
                        }
                        return true
                      }
                    })} 
                    disabled={loading}
                  />
                  {errors.expiryDate && (
                    <p className="text-sm text-destructive">{errors.expiryDate.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Hash (Optional)</Label>
                  <Input {...register('certHash')} placeholder="Certification hash (optional)" disabled={loading} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setOpen(false)
                  setEditing(null)
                  reset()
                }} disabled={loading}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Processing...' : editing ? 'Update' : 'Add'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingCert?.certName || 'Certification Details'}</DialogTitle>
              <DialogDescription>
                View certification information and status
              </DialogDescription>
            </DialogHeader>
            {viewingCert && (
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">{viewingCert.certName}</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Issue Date</Label>
                  <p className="text-sm">{new Date(viewingCert.issueDate).toLocaleDateString()}</p>
                </div>
                {viewingCert.expiryDate && (
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Expiry Date</Label>
                    <p className="text-sm">{new Date(viewingCert.expiryDate).toLocaleDateString()}</p>
                  </div>
                )}
                {viewingCert.expiryDate && (
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <StatusBadge status={getCertStatus(viewingCert) === 'expired' ? 'Expired' : 'Active'} />
                  </div>
                )}
                {viewingCert.certHash && (
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Hash</Label>
                    <p className="text-sm font-mono break-all">{viewingCert.certHash}</p>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Created At</Label>
                  <p className="text-sm">{new Date(viewingCert.createdAt).toLocaleString()}</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Updated At</Label>
                  <p className="text-sm">{new Date(viewingCert.updatedAt).toLocaleString()}</p>
                </div>
                {viewingCert.expiryDate && (
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Days Until Expiry</Label>
                    <p className="text-sm">
                      {getCertStatus(viewingCert) === 'expired' 
                        ? `Expired ${Math.ceil((new Date().getTime() - new Date(viewingCert.expiryDate).getTime()) / (1000 * 60 * 60 * 24))} days ago`
                        : `${Math.ceil((new Date(viewingCert.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining`
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
            </DialogFooter>
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
                          onView={() => handleView(cert)}
                          onEdit={() => handleEdit(cert)}
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
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleView(cert)} className="flex-1">View</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(cert)} className="flex-1">Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cert.id)} className="flex-1 text-destructive hover:text-destructive">Delete</Button>
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
