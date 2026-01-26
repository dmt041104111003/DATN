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
import { useProductHistory } from '@/hooks/use-product-history'

interface HistoryDialogProps {
  productId: string | undefined
  trigger: React.ReactNode
}

export function HistoryDialog({ productId, trigger }: HistoryDialogProps) {
  const [open, setOpen] = useState(false)
  const { history, loading } = useProductHistory(productId, open)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction History</DialogTitle>
          <DialogDescription>
            View all blockchain transactions for this NFT
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No transaction history found</p>
          ) : (
            <div className="space-y-2">
              {history.map((tx: any, index: number) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Transaction {index + 1}</span>
                    <span className="text-xs text-muted-foreground">{tx.action || 'Unknown'}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-muted-foreground">TX Hash: </span>
                      <span className="font-mono break-all">{tx.txHash}</span>
                    </div>
                    {tx.amount && (
                      <div>
                        <span className="text-muted-foreground">Amount: </span>
                        <span>{tx.amount}</span>
                      </div>
                    )}
                    {tx.blockTime && (
                      <div>
                        <span className="text-muted-foreground">Time: </span>
                        <span>{new Date(tx.blockTime * 1000).toLocaleString()}</span>
                      </div>
                    )}
                    {tx.blockHeight && (
                      <div>
                        <span className="text-muted-foreground">Block: </span>
                        <span>{tx.blockHeight}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
