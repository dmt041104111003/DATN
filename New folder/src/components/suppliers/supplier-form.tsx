"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Icon } from "@/components/ui/icon"
import type { CreateSupplierInput } from "@/types"

interface SupplierFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: CreateSupplierInput
  onFormChange: (data: CreateSupplierInput) => void
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
  onAutoFill?: () => void
}

export function SupplierForm({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  isPending,
  onAutoFill,
}: SupplierFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Icon name="add" size="sm" className="mr-2" />
          Add Supplier
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>New Supplier</DialogTitle>
            <DialogDescription>Add a new origin source for your products</DialogDescription>
            {onAutoFill && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onAutoFill}
                className="mt-2 text-xs"
              >
                <Icon name="auto_fix_high" size="sm" className="mr-1" />
                Auto-fill sample data
              </Button>
            )}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                placeholder="Supplier name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => onFormChange({ ...formData, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Info</Label>
              <Input
                id="contactInfo"
                value={formData.contactInfo}
                onChange={(e) => onFormChange({ ...formData, contactInfo: e.target.value })}
                placeholder="Phone or email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
