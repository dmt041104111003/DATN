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
import { MaterialFormProps } from '@/types/material'

export function Form(props: MaterialFormProps) {
  const { open, submitting, editing, form, suppliers, setOpen, handleCreate, handleClose, onSubmit } = props

  const dialogTitle = editing ? 'Edit Material' : 'Create Material'
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
              <Label htmlFor="supplierId">Supplier</Label>
              <Select
                value={form.watch('supplierId') || ''}
                onValueChange={(value) => form.setValue('supplierId', value)}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.supplierId && (
                <p className="text-sm text-destructive">{form.formState.errors.supplierId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Material Name</Label>
              <Input
                id="name"
                {...form.register('name', { required: 'Material name is required' })}
                placeholder="e.g. Coffee Beans, Cotton, Wheat"
                disabled={submitting}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="harvestDate">Harvest Date</Label>
              <Input
                id="harvestDate"
                type="date"
                {...form.register('harvestDate')}
                disabled={submitting}
              />
              {form.formState.errors.harvestDate && (
                <p className="text-sm text-destructive">{form.formState.errors.harvestDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                {...form.register('quantity', { valueAsNumber: true })}
                placeholder="e.g. 100.5"
                disabled={submitting}
              />
              {form.formState.errors.quantity && (
                <p className="text-sm text-destructive">{form.formState.errors.quantity.message}</p>
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
