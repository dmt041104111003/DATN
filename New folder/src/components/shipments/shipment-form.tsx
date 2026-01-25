"use client"

import { useEffect } from "react"
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
import type { CreateShipmentInput, Batch } from "@/types"

interface ShipmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: CreateShipmentInput
  onFormChange: (data: CreateShipmentInput) => void
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
  batches: Batch[]
}

export function ShipmentForm({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  isPending,
  batches,
}: ShipmentFormProps) {
  const selectedBatch = batches.find((b) => b.id === formData.batchId)
  
  const nextStep = selectedBatch?.roadmap?.find(
    (r) => r.stepOrder === (selectedBatch.currentStep || 0)
  )
  const nextAgent = nextStep?.agent

  useEffect(() => {
    if (selectedBatch && nextAgent) {
      onFormChange({
        ...formData,
        receiverAgentId: nextAgent.id,
        destination: nextAgent.location || "",
      })
    }
  }, [selectedBatch?.id])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Icon name="add" size="sm" className="mr-2" />
          Create Shipment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Shipment</DialogTitle>
          <DialogDescription>
            Ship a batch to the next agent in the roadmap.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Select Batch *</Label>
            <Select
              value={formData.batchId}
              onValueChange={(value) => {
                const batch = batches.find((b) => b.id === value)
                const step = batch?.roadmap?.find(
                  (r) => r.stepOrder === (batch.currentStep || 0)
                )
                onFormChange({ 
                  ...formData, 
                  batchId: value,
                  receiverAgentId: step?.agent?.id || "",
                  destination: step?.agent?.location || "",
                })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name} ({batch.currentQuantity} {batch.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBatch && selectedBatch.roadmap && selectedBatch.roadmap.length > 0 && (
            <div className="bg-muted/30 border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Delivery Roadmap</span>
                <span className="text-xs text-muted-foreground">
                  Step {(selectedBatch.currentStep || 0) + 1}/{selectedBatch.roadmap.length}
                </span>
              </div>
              
              <div className="space-y-1.5">
                {selectedBatch.roadmap.map((step, idx) => {
                  const isCompleted = step.isCompleted
                  const isCurrent = idx === (selectedBatch.currentStep || 0)
                  
                  return (
                    <div 
                      key={step.id} 
                      className={`flex items-center gap-2 p-2 rounded text-sm ${
                        isCompleted ? 'bg-green-500/10' : 
                        isCurrent ? 'bg-primary/10 border border-primary/30' : 
                        'bg-muted/50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                        isCompleted ? 'bg-green-500 text-white' :
                        isCurrent ? 'bg-primary text-primary-foreground' :
                        'bg-muted-foreground/30 text-muted-foreground'
                      }`}>
                        {isCompleted ? <Icon name="check" size="xs" /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${
                          isCompleted ? 'text-green-600' : 
                          isCurrent ? 'text-primary' : 
                          'text-muted-foreground'
                        }`}>
                          {step.agent?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {step.agent?.location || step.location}
                        </p>
                      </div>
                      <div className="shrink-0 text-xs">
                        {isCompleted && step.completedAt ? (
                          <span className="text-green-600">{formatDate(step.completedAt)}</span>
                        ) : isCurrent ? (
                          <span className="text-primary font-medium">Next</span>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {nextAgent && (
            <div className="bg-muted/50 p-3 rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground">Receiver</Label>
                <span className="font-medium">{nextAgent.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground">Destination</Label>
                <span className="text-sm">{nextAgent.location || "-"}</span>
              </div>
              {nextAgent.gpsCoordinates && (
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">GPS</Label>
                  <span className="text-xs font-mono">{nextAgent.gpsCoordinates}</span>
                </div>
              )}
            </div>
          )}

          {selectedBatch && nextAgent && (
            <div className="bg-primary/5 border border-primary/20 p-3 rounded-md text-sm">
              <p className="font-medium">Shipment Summary</p>
              <div className="mt-2 space-y-1 text-muted-foreground">
                <p>• Batch: {selectedBatch.name}</p>
                <p>• Quantity: {selectedBatch.currentQuantity} {selectedBatch.unit} (entire batch)</p>
                <p>• To: {nextAgent.name}</p>
                <p>• Address: {nextAgent.location}</p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !selectedBatch || !nextAgent}
            >
              {isPending ? "Creating..." : "Create Shipment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
