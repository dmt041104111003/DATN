"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { StatusBadge } from '@/components/ui/status-badge'
import { SubListCard } from '../shared/sub-list-card'
import { handleApiError } from '@/lib/utils/error-handler'
import { showAlert } from '@/lib/utils/alert'
import { confirm } from '@/lib/utils/confirm'

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
      showAlert({ description: 'Expiry date must be after issue date', variant: 'warning' })
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
      const errorMessage = handleApiError(err, router)
      showAlert({ description: errorMessage, variant: 'error' })
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
    if (!(await confirm('Delete this certification?'))) return
    try {
      await apiClient.certifications.remove(id)
      onRefresh()
    } catch (err) {
      const errorMessage = handleApiError(err, router)
      showAlert({ description: errorMessage, variant: 'error' })
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
    <SubListCard
      title="Certifications"
      items={certifications}
      columns={[
        { key: 'certName', header: 'Name', render: (c: Certification) => <span className="font-medium">{c.certName}</span> },
        { key: 'issueDate', header: 'Issue Date', render: (c: Certification) => new Date(c.issueDate).toLocaleDateString() },
        { key: 'expiryDate', header: 'Expiry Date', render: (c: Certification) => c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : '-' },
        { key: 'certHash', header: 'Hash', render: (c: Certification) => <span className="font-mono text-xs">{c.certHash || '-'}</span>, className: 'font-mono text-xs' },
      ]}
      actions={(cert: Certification) => ({
        onView: () => handleView(cert),
        onEdit: () => handleEdit(cert),
        onDelete: () => handleDelete(cert.id),
      })}
      mobileCardTitle={(c: Certification) => c.certName}
      mobileCardDescription={(c: Certification) => (
        <span className="text-xs text-muted-foreground break-words">
          Issued: {new Date(c.issueDate).toLocaleDateString()}
          {c.expiryDate && ` | Expires: ${new Date(c.expiryDate).toLocaleDateString()}`}
        </span>
      )}
      emptyMessage="No certifications"
      dialogOpen={open}
      onDialogOpenChange={(open: boolean) => {
        setOpen(open)
        if (!open) {
          setEditing(null)
          reset()
        }
      }}
      dialogTrigger={<Button size="sm" onClick={handleCreate} className="w-full sm:w-auto">Add</Button>}
      submitting={loading}
      viewDialog={
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
      }
      dialogContent={
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Certification' : 'Add Certification'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 px-4 py-4 min-w-0 w-full">
            <div className="grid gap-2">
              <Label>Name *</Label>
              <Input 
                {...register('certName', { required: 'Please enter certification name' })} 
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
      }
    />
  )
}
