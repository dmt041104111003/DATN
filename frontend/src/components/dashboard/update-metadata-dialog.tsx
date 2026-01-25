"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MetadataPreview } from './metadata-preview'
import { useProductUpdate } from '@/hooks/use-product-update'
import { Product } from '@/types/api'

interface UpdateMetadataDialogProps {
  product: Product | null
  user: { address: string; walletName?: string } | null
  onSuccess: () => void
  trigger: React.ReactNode
}

export function UpdateMetadataDialog({ product, user, onSuccess, trigger }: UpdateMetadataDialogProps) {
  const [open, setOpen] = useState(false)
  const updateHook = useProductUpdate(product, user, () => {
    setOpen(false)
    onSuccess()
  })

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        updateHook.reset()
      }
    }}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Update NFT Metadata</DialogTitle>
          <DialogDescription>
            Update the metadata of this NFT on the blockchain
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              This will update the on-chain metadata with current product information.
            </p>
            {!updateHook.reviewMetadata && !updateHook.preparedMetadata && (
              <div className="grid gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={updateHook.prepareMetadata}
                  disabled={updateHook.updating}
                >
                  Review Metadata
                </Button>
                <p className="text-xs text-muted-foreground">Review product information that will be updated on blockchain</p>
              </div>
            )}
            {updateHook.reviewMetadata && updateHook.preparedMetadata && (
              <MetadataPreview
                metadata={updateHook.preparedMetadata}
                onHide={() => {
                  updateHook.setReviewMetadata(false)
                  updateHook.setPreparedMetadata(null)
                }}
              />
            )}
            {updateHook.updateStep && (
              <div className="py-2 text-sm text-muted-foreground">
                {updateHook.updateStep}
              </div>
            )}
            {updateHook.updateError && (
              <div className="py-2 text-sm text-destructive">
                {updateHook.updateError}
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setOpen(false)
              updateHook.reset()
            }}
            disabled={updateHook.updating}
          >
            Cancel
          </Button>
          <Button onClick={updateHook.update} disabled={updateHook.updating}>
            {updateHook.updating ? 'Processing...' : 'Update Metadata'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
