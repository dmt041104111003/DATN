"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageUpload } from "@/components/ui/image-upload"
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
import type { CreateProductInput, Material, Certification } from "@/types"

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: CreateProductInput
  onFormChange: (data: CreateProductInput) => void
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
  materials?: Material[]
  loadingMaterials?: boolean
  certifications?: Certification[]
  loadingCertifications?: boolean
}

export function ProductForm({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  isPending,
  materials = [],
  loadingMaterials = false,
  certifications = [],
  loadingCertifications = false,
}: ProductFormProps) {
  const toggleMaterial = (materialId: string) => {
    const currentIds = formData.materialIds || []
    const newIds = currentIds.includes(materialId)
      ? currentIds.filter((id) => id !== materialId)
      : [...currentIds, materialId]
    onFormChange({ ...formData, materialIds: newIds })
  }

  const toggleCertification = (certificationId: string) => {
    const currentIds = formData.certificationIds || []
    const newIds = currentIds.includes(certificationId)
      ? currentIds.filter((id) => id !== certificationId)
      : [...currentIds, certificationId]
    onFormChange({ ...formData, certificationIds: newIds })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Icon name="add" size="sm" className="mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>New Product</DialogTitle>
            <DialogDescription>Add a new product for origin tracking</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                placeholder="Product name"
                required
              />
            </div>
            <ImageUpload
              label="Product Image"
              value={formData.imageUrl}
              onChange={(url) => onFormChange({ ...formData, imageUrl: url })}
            />
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
                placeholder="Product description..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Materials *</Label>
              {loadingMaterials ? (
                <p className="text-sm text-muted-foreground">Loading materials...</p>
              ) : materials.length === 0 ? (
                <p className="text-sm text-destructive">
                  No materials available. Create materials from the Materials page first.
                </p>
              ) : (
                <div className="border rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
                  {materials.map((material) => (
                    <div key={material.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`material-${material.id}`}
                        checked={formData.materialIds?.includes(material.id) || false}
                        onCheckedChange={() => toggleMaterial(material.id)}
                      />
                      <label
                        htmlFor={`material-${material.id}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {material.name}
                        {material.supplier && (
                          <span className="text-muted-foreground ml-1">
                            - {material.supplier.name}
                          </span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {formData.materialIds && formData.materialIds.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {formData.materialIds.length} material(s) selected
                </p>
              ) : materials.length > 0 && (
                <p className="text-xs text-destructive">
                  Please select at least one material
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Certifications *</Label>
              {loadingCertifications ? (
                <p className="text-sm text-muted-foreground">Loading certifications...</p>
              ) : certifications.length === 0 ? (
                <p className="text-sm text-destructive">
                  No certifications available. Create certifications from the Certifications page first.
                </p>
              ) : (
                <div className="border rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cert-${cert.id}`}
                        checked={formData.certificationIds?.includes(cert.id) || false}
                        onCheckedChange={() => toggleCertification(cert.id)}
                      />
                      <label
                        htmlFor={`cert-${cert.id}`}
                        className="text-sm font-medium leading-none cursor-pointer flex-1"
                      >
                        <span className="flex items-center gap-1">
                          <Icon name="verified" size="xs" className="text-primary" />
                          {cert.certName}
                        </span>
                        <span className="text-xs text-muted-foreground block">
                          {formatDate(cert.issueDate)}
                          {cert.expiryDate && ` - ${formatDate(cert.expiryDate)}`}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {formData.certificationIds && formData.certificationIds.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {formData.certificationIds.length} certification(s) selected
                </p>
              ) : certifications.length > 0 && (
                <p className="text-xs text-destructive">
                  Please select at least one certification
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button 
              type="submit" 
              disabled={
                isPending || 
                !formData.materialIds || formData.materialIds.length === 0 ||
                !formData.certificationIds || formData.certificationIds.length === 0
              }
            >
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
