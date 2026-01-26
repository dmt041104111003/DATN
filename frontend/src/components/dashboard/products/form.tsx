"use client"

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingOverlay } from '@/components/ui/loading'
import { ProductFormProps } from '@/types/product'

export function Form(props: ProductFormProps) {
  const { open, submitting, editing, form, setOpen, handleCreate, handleClose, onSubmit } = props

  const dialogTitle = editing ? 'Edit Product' : 'Create Product'
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
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...form.register('name', { required: 'Product name is required' })}
                placeholder="e.g. Organic Coffee Beans"
                disabled={submitting}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
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
