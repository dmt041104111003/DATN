"use client"

import { useState } from "react"
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
import type { Product, Material, Certification, UpdateProductInput } from "@/types"

interface ProductEditDialogProps {
  product: Product
  materials: Material[]
  certifications: Certification[]
  onUpdate: (id: string, data: UpdateProductInput) => Promise<void>
  isPending?: boolean
}

export function ProductEditDialog({
  product,
  materials,
  certifications,
  onUpdate,
  isPending,
}: ProductEditDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<UpdateProductInput>({
    name: product.name,
    description: product.description || "",
    imageUrl: product.imageUrl || "",
    materialIds: product.productMaterials?.map((pm) => pm.materialId) || [],
    certificationIds: product.productCertifications?.map((pc) => pc.certificationId) || [],
  })

  const toggleMaterial = (materialId: string) => {
    const currentIds = formData.materialIds || []
    const newIds = currentIds.includes(materialId)
      ? currentIds.filter((id) => id !== materialId)
      : [...currentIds, materialId]
    setFormData({ ...formData, materialIds: newIds })
  }

  const toggleCertification = (certificationId: string) => {
    const currentIds = formData.certificationIds || []
    const newIds = currentIds.includes(certificationId)
      ? currentIds.filter((id) => id !== certificationId)
      : [...currentIds, certificationId]
    setFormData({ ...formData, certificationIds: newIds })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onUpdate(product.id, formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Icon name="edit" size="sm" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Product name"
                required
              />
            </div>
            <ImageUpload
              label="Product Image"
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            />
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Materials *</Label>
              {materials.length === 0 ? (
                <p className="text-sm text-destructive">No materials available.</p>
              ) : (
                <div className="border rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
                  {materials.map((material) => (
                    <div key={material.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-material-${material.id}`}
                        checked={formData.materialIds?.includes(material.id) || false}
                        onCheckedChange={() => toggleMaterial(material.id)}
                      />
                      <label
                        htmlFor={`edit-material-${material.id}`}
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
              {formData.materialIds && formData.materialIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formData.materialIds.length} material(s) selected
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Certifications *</Label>
              {certifications.length === 0 ? (
                <p className="text-sm text-destructive">No certifications available.</p>
              ) : (
                <div className="border rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-cert-${cert.id}`}
                        checked={formData.certificationIds?.includes(cert.id) || false}
                        onCheckedChange={() => toggleCertification(cert.id)}
                      />
                      <label
                        htmlFor={`edit-cert-${cert.id}`}
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
              {formData.certificationIds && formData.certificationIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formData.certificationIds.length} certification(s) selected
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isPending ||
                !formData.materialIds ||
                formData.materialIds.length === 0 ||
                !formData.certificationIds ||
                formData.certificationIds.length === 0
              }
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
