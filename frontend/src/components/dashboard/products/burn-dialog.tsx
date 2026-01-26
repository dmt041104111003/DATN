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
import { useProductBurn } from '@/hooks/use-product-burn'
import { Product } from '@/types/api'

interface BurnDialogProps {
  product: Product | null
  user: { address: string; walletName?: string } | null
  onSuccess: () => void
  trigger: React.ReactNode
}

export function BurnDialog({ product, user, onSuccess, trigger }: BurnDialogProps) {
  const [open, setOpen] = useState(false)
  const [burnQuantity, setBurnQuantity] = useState('1')
  const burnHook = useProductBurn(product, user, () => {
    setOpen(false)
    setBurnQuantity('1')
    onSuccess()
  })

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        burnHook.reset()
        setBurnQuantity('1')
      }
    }}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Burn NFT</DialogTitle>
          <DialogDescription>
            Permanently destroy this NFT from the blockchain
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="burnQuantity">Quantity</Label>
              <Input
                id="burnQuantity"
                type="number"
                min="1"
                value={burnQuantity}
                onChange={(e) => setBurnQuantity(e.target.value)}
                placeholder="1"
                disabled={burnHook.burning}
              />
              <p className="text-xs text-muted-foreground">
                Enter the quantity of NFTs to burn
              </p>
            </div>
            {burnHook.burnStep && (
              <div className="py-2 text-sm text-muted-foreground">
                {burnHook.burnStep}
              </div>
            )}
            {burnHook.burnError && (
              <div className="py-2 text-sm text-destructive">
                {burnHook.burnError}
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
              burnHook.reset()
              setBurnQuantity('1')
            }}
            disabled={burnHook.burning}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => burnHook.burn(burnQuantity)} disabled={burnHook.burning}>
            {burnHook.burning ? 'Processing...' : 'Burn NFT'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
