"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icon } from "@/components/ui/icon"
import type { CreateBatchInput, Product, Agent } from "@/types"

interface BatchFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: CreateBatchInput
  onFormChange: (data: CreateBatchInput) => void
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
  products: Product[]
  agents: Agent[]
  loadingProducts?: boolean
  loadingAgents?: boolean
}

export function BatchForm({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  isPending,
  products,
  agents,
  loadingProducts,
  loadingAgents,
}: BatchFormProps) {
  const selectedAgents = formData.roadmapAgentIds
    .map(id => agents.find(a => a.id === id))
    .filter(Boolean) as Agent[]

  const availableAgents = agents.filter(a => !formData.roadmapAgentIds.includes(a.id))

  const addAgentToRoadmap = (agentId: string) => {
    onFormChange({
      ...formData,
      roadmapAgentIds: [...formData.roadmapAgentIds, agentId],
    })
  }

  const removeAgentFromRoadmap = (index: number) => {
    const newIds = [...formData.roadmapAgentIds]
    newIds.splice(index, 1)
    onFormChange({ ...formData, roadmapAgentIds: newIds })
  }

  const moveAgent = (index: number, direction: 'up' | 'down') => {
    const newIds = [...formData.roadmapAgentIds]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= newIds.length) return
    [newIds[index], newIds[newIndex]] = [newIds[newIndex], newIds[index]]
    onFormChange({ ...formData, roadmapAgentIds: newIds })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Icon name="add" size="sm" className="mr-2" />
          Create Batch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Batch</DialogTitle>
          <DialogDescription>
            Create a new product batch. You can mint it as NFT later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Product *</Label>
                <Select
                  value={formData.productId || ""}
                  onValueChange={(value) => {
                    const product = products.find(p => p.id === value)
                    onFormChange({ 
                      ...formData, 
                      productId: value,
                      name: product?.name ? `${product.name} - Batch` : formData.name,
                    })
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingProducts ? "Loading..." : "Select product"} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {products.length === 0 && !loadingProducts && (
                  <p className="text-xs text-muted-foreground">
                    No products found. Please create a product first.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Batch Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                  placeholder="e.g. Arabica Coffee - January Batch"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initialQuantity">Initial Quantity *</Label>
                <Input
                  id="initialQuantity"
                  type="number"
                  min="1"
                  value={formData.initialQuantity}
                  onChange={(e) => onFormChange({ ...formData, initialQuantity: parseInt(e.target.value) || 0 })}
                  placeholder="100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit || ""}
                  onChange={(e) => onFormChange({ ...formData, unit: e.target.value })}
                  placeholder="kg, pcs, boxes..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productionDate">Production Date</Label>
                <Input
                  id="productionDate"
                  type="date"
                  value={formData.productionDate || ""}
                  onChange={(e) => onFormChange({ ...formData, productionDate: e.target.value })}
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

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
                  placeholder="Batch description..."
                  rows={4}
                />
              </div>
              <ImageUpload
                label="Batch Image"
                value={formData.imageUrl}
                onChange={(url) => onFormChange({ ...formData, imageUrl: url })}
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <Label>Roadmap - Lộ trình vận chuyển *</Label>
              <span className="text-xs text-muted-foreground">
                Chọn agents theo thứ tự
              </span>
            </div>
            
            {selectedAgents.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                {selectedAgents.map((agent, index) => (
                  <div key={agent.id} className="flex items-center gap-2 bg-background rounded-md p-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{agent.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {agent.location} {agent.gpsCoordinates && `• GPS: ${agent.gpsCoordinates}`}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveAgent(index, 'up')}
                        disabled={index === 0}
                        className="h-7 w-7 p-0"
                      >
                        <Icon name="keyboard_arrow_up" size="sm" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveAgent(index, 'down')}
                        disabled={index === selectedAgents.length - 1}
                        className="h-7 w-7 p-0"
                      >
                        <Icon name="keyboard_arrow_down" size="sm" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAgentFromRoadmap(index)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <Icon name="close" size="sm" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Select
              value=""
              onValueChange={addAgentToRoadmap}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingAgents ? "Loading..." : "Thêm agent vào roadmap"} />
              </SelectTrigger>
              <SelectContent>
                {availableAgents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name} - {agent.location || "No location"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {formData.roadmapAgentIds.length === 0 && (
              <p className="text-xs text-destructive">
                Phải chọn ít nhất 1 agent cho roadmap
              </p>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button 
              type="submit" 
              disabled={isPending || formData.roadmapAgentIds.length === 0}
            >
              {isPending ? "Creating..." : "Create Batch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
