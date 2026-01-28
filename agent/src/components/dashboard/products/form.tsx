"use client"

import { useState } from 'react'
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
import { ProductFormProps } from '@/types/product'
import { X } from 'lucide-react'

export function Form(props: ProductFormProps) {
  const { open, submitting, editing, form, availableMaterials, availableMedia, materials, media, onMaterialsChange, onMediaChange, setOpen, handleCreate, handleClose, onSubmit } = props
  
  const [selectedMaterialId, setSelectedMaterialId] = useState('')
  const [selectedMediaId, setSelectedMediaId] = useState('')

  const handleMaterialChange = (materialId: string) => {
    setSelectedMaterialId(materialId)
    if (materialId) {
      const material = availableMaterials.find(m => m.id === materialId)
      if (material && !materials.find(pm => pm.materialId === materialId)) {
        const newItem = {
          materialId: materialId,
          material: {
            id: material.id,
            name: material.name,
            supplier: material.supplier ? { name: material.supplier.name } : undefined,
          },
        }
        onMaterialsChange([...materials, newItem])
        setSelectedMaterialId('')
      }
    }
  }

  const handleRemoveMaterial = (index: number) => {
    onMaterialsChange(materials.filter((_, i) => i !== index))
  }

  const handleMediaChange = (mediaId: string) => {
    setSelectedMediaId(mediaId)
    if (mediaId) {
      const mediaItem = availableMedia.find(m => m.id === mediaId)
      if (mediaItem && !media.find(m => m.id === mediaId)) {
        onMediaChange([...media, mediaItem])
        setSelectedMediaId('')
      }
    }
  }

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {submitting && <LoadingOverlay />}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 px-4 py-4 min-w-0 w-full">
            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label>Materials (Select multiple)</Label>
              <Select value={selectedMaterialId} onValueChange={handleMaterialChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {availableMaterials
                    .filter(m => !materials.find(pm => pm.materialId === m.id))
                    .map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} {m.supplier && `(${m.supplier.name})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {materials.length > 0 && (
                <div className="mt-2 space-y-1">
                  {materials.map((pm, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                      <div className="flex-1">
                        <span className="font-medium">{pm.material?.name}</span>
                        {pm.material?.supplier && (
                          <span className="text-muted-foreground ml-2">({pm.material.supplier.name})</span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveMaterial(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Media</Label>
              <Select value={selectedMediaId} onValueChange={handleMediaChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select media" />
                </SelectTrigger>
                <SelectContent>
                  {availableMedia.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {media.length > 0 && (
                <div className="mt-2 space-y-1">
                  {media.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-2 border rounded text-sm">
                      <span>{m.name} ({m.type})</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onMediaChange(media.filter(item => item.id !== m.id))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
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
