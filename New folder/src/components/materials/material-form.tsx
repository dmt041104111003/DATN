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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icon } from "@/components/ui/icon"
import type { CreateMaterialInput, Supplier } from "@/types"

interface MaterialFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: CreateMaterialInput
  onFormChange: (data: CreateMaterialInput) => void
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
  suppliers?: Supplier[]
}

export function MaterialForm({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  isPending,
  suppliers,
}: MaterialFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Icon name="add" size="sm" className="mr-2" />
          Add Material
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>New Material</DialogTitle>
            <DialogDescription>Add a new raw material with origin information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                placeholder="Material name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Supplier *</Label>
              {!suppliers || suppliers.length === 0 ? (
                <p className="text-sm text-destructive">
                  No suppliers available. Create suppliers first.
                </p>
              ) : (
                <Select
                  value={formData.supplierId}
                  onValueChange={(value) => onFormChange({ ...formData, supplierId: value })}
                  required
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
              )}
              {suppliers && suppliers.length > 0 && !formData.supplierId && (
                <p className="text-xs text-destructive">Please select a supplier</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => onFormChange({ ...formData, quantity: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="harvestDate">Harvest Date</Label>
                <Input
                  id="harvestDate"
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => onFormChange({ ...formData, harvestDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || !formData.supplierId}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
