"use client"

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { LoadingOverlay } from '@/components/ui/loading'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CertificationFormProps } from '@/types/certification'

export function Form(props: CertificationFormProps) {
  const { open, submitting, editing, products, form, setOpen, handleCreate, handleClose, onSubmit } = props

  const dialogTitle = editing ? 'Edit Certification' : 'Create Certification'
  const submitButtonText = submitting
    ? 'Processing...'
    : editing
      ? 'Update'
      : 'Create'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          Add more
        </Button>
      </DialogTrigger>
      <DialogContent>
        {submitting && <LoadingOverlay />}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 px-4 py-4 min-w-0 w-full">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select
                value={form.watch('productId')}
                onValueChange={(value) => form.setValue('productId', value, { shouldValidate: true })}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.productId && (
                <p className="text-sm text-destructive">{form.formState.errors.productId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="certName">Certification Name</Label>
              <Input
                id="certName"
                {...form.register('certName', { required: 'Certification name is required' })}
                placeholder="e.g. ISO 9001, Organic Certification, Fair Trade"
                disabled={submitting}
              />
              {form.formState.errors.certName && (
                <p className="text-sm text-destructive">{form.formState.errors.certName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                {...form.register('issueDate', { required: 'Issue date is required' })}
                disabled={submitting}
              />
              {form.formState.errors.issueDate && (
                <p className="text-sm text-destructive">{form.formState.errors.issueDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                {...form.register('expiryDate')}
                disabled={submitting}
              />
              {form.formState.errors.expiryDate && (
                <p className="text-sm text-destructive">{form.formState.errors.expiryDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="certHash">Certification Hash</Label>
              <Input
                id="certHash"
                {...form.register('certHash')}
                placeholder="e.g. Blockchain hash or certificate ID"
                disabled={submitting}
              />
              {form.formState.errors.certHash && (
                <p className="text-sm text-destructive">{form.formState.errors.certHash.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
