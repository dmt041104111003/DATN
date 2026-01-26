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
import { LocationPicker } from '@/components/ui/location-picker'
import { SupplierFormProps } from '@/types/supplier'

export function Form(props: SupplierFormProps) {
  const { open, submitting, editing, form, location, setLocation, setOpen, handleCreate, handleClose, onSubmit } = props

  const dialogTitle = editing ? 'Edit Supplier' : 'Create Supplier'
  const submitButtonText = submitting
    ? 'Processing...'
    : editing
      ? 'Update'
      : 'Create'

  const formFields = {
    name: {
      id: 'name' as const,
      label: 'Name',
      placeholder: 'e.g. ABC Supplier Co.',
      required: 'Name is required',
    },
    contactInfo: {
      id: 'contactInfo' as const,
      label: 'Contact Info',
      placeholder: 'e.g. +1234567890, email@example.com',
    },
  }

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
              <Label htmlFor="name">{formFields.name.label}</Label>
              <Input
                id="name"
                {...form.register('name', { required: formFields.name.required })}
                placeholder={formFields.name.placeholder}
                disabled={submitting}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactInfo">{formFields.contactInfo.label}</Label>
              <Input
                id="contactInfo"
                {...form.register('contactInfo')}
                placeholder={formFields.contactInfo.placeholder}
                disabled={submitting}
              />
              {form.formState.errors.contactInfo && (
                <p className="text-sm text-destructive">{form.formState.errors.contactInfo.message}</p>
              )}
            </div>
            <LocationPicker
              value={location}
              onChange={setLocation}
              label="Location"
              disabled={submitting}
            />
            {location?.gpsCoordinates && (
              <div className="grid gap-2">
                <p className="text-xs text-muted-foreground font-mono">
                  GPS: {location.gpsCoordinates}
                </p>
              </div>
            )}
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
