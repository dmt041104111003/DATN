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
import { ImageUpload } from "@/components/ui/image-upload"
import type { CreateCertificationInput } from "@/types"

interface CertificationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: CreateCertificationInput
  onFormChange: (data: CreateCertificationInput) => void
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
  onAutoFill?: () => void
}

export function CertificationForm({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  isPending,
  onAutoFill,
}: CertificationFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Icon name="add" className="mr-2" size="sm" />
          Add Certification
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Certification</DialogTitle>
          <DialogDescription>Create a certification to link with products</DialogDescription>
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
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="certName">Certification Name *</Label>
            <Input
              id="certName"
              placeholder="e.g. VietGAP, GlobalGAP, ISO 22000"
              value={formData.certName}
              onChange={(e) => onFormChange({ ...formData, certName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date *</Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => onFormChange({ ...formData, issueDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate || ""}
                onChange={(e) => onFormChange({ ...formData, expiryDate: e.target.value })}
              />
            </div>
          </div>

          <ImageUpload
            label="Certificate Document *"
            value={formData.certHash}
            onChange={(url) => onFormChange({ ...formData, certHash: url })}
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending || !formData.certName || !formData.issueDate || !formData.certHash}
            >
              {isPending ? "Creating..." : "Add Certification"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
