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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MetadataPreview } from './metadata-preview'
import { useProductMint } from '@/hooks/use-product-mint'
import { Product } from '@/types/api'

interface MintDialogProps {
  product: Product | null
  user: { address: string; walletName?: string } | null
  onSuccess: () => void
  trigger: React.ReactNode
}

export function MintDialog({ product, user, onSuccess, trigger }: MintDialogProps) {
  const [open, setOpen] = useState(false)
  const [assetName, setAssetName] = useState('')
  const mintHook = useProductMint(product, user, () => {
    setOpen(false)
    setAssetName('')
    onSuccess()
  })

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        mintHook.reset()
        setAssetName('')
      }
    }}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Mint Product as NFT</DialogTitle>
          <DialogDescription>
            Create an NFT for this product on Cardano blockchain
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="assetName">Asset Name *</Label>
              <Input
                id="assetName"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="Enter unique asset name"
                disabled={mintHook.minting}
              />
              <p className="text-xs text-muted-foreground">This name must be unique on the blockchain</p>
            </div>
            {!mintHook.reviewMetadata && !mintHook.preparedMetadata && (
              <div className="grid gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={mintHook.prepareMetadata}
                  disabled={mintHook.minting}
                >
                  Review Metadata
                </Button>
                <p className="text-xs text-muted-foreground">Review product information that will be stored on blockchain</p>
              </div>
            )}
            {mintHook.reviewMetadata && mintHook.preparedMetadata && (
              <MetadataPreview
                metadata={mintHook.preparedMetadata}
                onHide={() => {
                  mintHook.setReviewMetadata(false)
                  mintHook.setPreparedMetadata(null)
                }}
              />
            )}
            {mintHook.mintStep && (
              <div className="py-2 text-sm text-muted-foreground">
                {mintHook.mintStep}
              </div>
            )}
            {mintHook.mintError && (
              <div className="py-2 text-sm text-destructive">
                {mintHook.mintError}
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
              mintHook.reset()
              setAssetName('')
            }}
            disabled={mintHook.minting}
          >
            Cancel
          </Button>
          <Button onClick={() => mintHook.mint(assetName)} disabled={mintHook.minting || !assetName.trim()}>
            {mintHook.minting ? 'Processing...' : 'Mint NFT'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
