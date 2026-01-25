"use client"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import type { WalletInfo } from "@/hooks/use-wallet"

interface WalletListProps {
  wallets: WalletInfo[]
  connecting: string | null
  onConnect: (walletId: string) => void
}

export function WalletList({ wallets, connecting, onConnect }: WalletListProps) {
  return (
    <div className="space-y-3">
      {wallets.map((wallet) => (
        <Button
          key={wallet.id}
          className="w-full h-12 justify-start"
          variant="outline"
          onClick={() => onConnect(wallet.id)}
          disabled={connecting !== null}
        >
          {wallet.icon && (
            <img
              src={wallet.icon}
              alt={wallet.name}
              className="mr-3 h-6 w-6"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
          <span className="flex-1 text-left">Connect with {wallet.name}</span>
          {connecting === wallet.id && (
            <Icon name="progress_activity" size="sm" className="animate-spin" />
          )}
        </Button>
      ))}
    </div>
  )
}
