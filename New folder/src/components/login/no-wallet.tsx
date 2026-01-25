"use client"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

const WALLET_LINKS = [
  { name: "Nami", url: "https://namiwallet.io" },
  { name: "Eternl", url: "https://eternl.io" },
  { name: "Flint", url: "https://flint-wallet.com" },
  { name: "Lace", url: "https://lace.io" },
]

export function NoWalletDetected() {
  return (
    <div className="text-center py-8">
      <Icon name="account_balance_wallet" size="xl" className="mx-auto text-muted-foreground" />
      <p className="mt-4 font-medium">No Cardano wallet detected</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Please install a Cardano wallet extension to continue
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {WALLET_LINKS.map((wallet) => (
          <a key={wallet.name} href={wallet.url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">{wallet.name}</Button>
          </a>
        ))}
      </div>
    </div>
  )
}
