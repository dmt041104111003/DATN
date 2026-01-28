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
import { AgentFormProps } from '@/types/agent'

export function Form(props: AgentFormProps) {
  const { open, submitting, form, location, setLocation, setOpen, handleCreate, handleClose, onSubmit } = props

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
              <Label htmlFor="walletAddress">Wallet Address</Label>
              <Input
                id="walletAddress"
                {...form.register('walletAddress', { required: 'Wallet address is required' })}
                placeholder="addr1..."
                disabled={submitting}
              />
              {form.formState.errors.walletAddress && (
                <p className="text-sm text-destructive">{form.formState.errors.walletAddress.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Agent Name</Label>
              <Input
                id="displayName"
                {...form.register('displayName')}
                placeholder="Agent name"
                disabled={submitting}
              />
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
              {submitting ? 'Processing...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

