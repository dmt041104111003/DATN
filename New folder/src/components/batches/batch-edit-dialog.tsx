"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Batch, UpdateBatchInput } from "@/types"

interface BatchEditDialogProps {
  batch: Batch | null
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: UpdateBatchInput
  onFormChange: (data: UpdateBatchInput) => void
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
}

export function BatchEditDialog({
  batch,
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  isPending,
}: BatchEditDialogProps) {
  if (!batch) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Update Batch</DialogTitle>
            <DialogDescription>
              Update batch metadata on blockchain. ID: {batch.id.slice(-8)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name || ""}
                onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                placeholder="Batch name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description || ""}
                onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
                placeholder="Batch description..."
                rows={3}
              />
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Quantity: {batch.currentQuantity}/{batch.initialQuantity} {batch.unit}</p>
              <p>• Status: {batch.status}</p>
              {batch.assetName && <p>• Asset: {batch.assetName}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update on Blockchain"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
