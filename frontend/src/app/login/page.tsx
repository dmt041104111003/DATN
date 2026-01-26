"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BrowserWallet } from '@meshsdk/core'
import { WalletButton } from '@/components/ui/wallet-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWallet } from '@/hooks/use-wallet'
import { useAuth } from '@/contexts/auth-context'
import { authApi } from '@/lib/api/auth'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Network = 'mainnet' | 'preprod'

const NETWORK_STORAGE_KEY = 'selected_network'

export default function LoginPage() {
  const router = useRouter()
  const { error, connectWallet, login } = useWallet()
  const { refreshAuth } = useAuth()
  const [wallets, setWallets] = useState<ReturnType<typeof BrowserWallet.getInstalledWallets>>([])
  const [loadingWallet, setLoadingWallet] = useState<string | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(NETWORK_STORAGE_KEY) as Network | null
      if (saved === 'mainnet' || saved === 'preprod') {
        return saved
      }
    }
    return 'preprod'
  })

  useEffect(() => {
    try {
      setWallets(BrowserWallet.getInstalledWallets())
    } catch {
      setWallets([])
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(NETWORK_STORAGE_KEY, selectedNetwork)
    }
  }, [selectedNetwork])

  const handleWalletClick = async (walletName: string) => {
    if (loadingWallet) return
    
    setLoadingWallet(walletName)
    try {
      const result = await connectWallet(walletName, selectedNetwork)
      await login(result.wallet, result.address, walletName)
      await refreshAuth()
      
      const userData = await authApi.getMe()
      const role = userData.user.role
      
      if (role === 'AGENT') {
        window.location.href = '/agent/products'
      } else {
        window.location.href = '/dashboard'
      }
    } catch {} finally {
      setLoadingWallet(null)
    }
  }

  const isLoggingIn = !!loadingWallet

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className={isLoggingIn ? "pointer-events-none opacity-50" : ""}>
        <Header />
      </div>
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className={`w-full max-w-md ${isLoggingIn ? "pointer-events-none opacity-50" : ""}`}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="network">Select Network</Label>
              <Select value={selectedNetwork} onValueChange={(value: Network) => setSelectedNetwork(value)} disabled={!!loadingWallet}>
                <SelectTrigger id="network">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preprod">Preprod (Testnet)</SelectItem>
                  <SelectItem value="mainnet">Mainnet</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Make sure your wallet is connected to the same network
              </p>
            </div>

            {wallets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No Cardano wallet detected. Please install a wallet extension.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {wallets.map((wallet) => {
                  const isLoading = loadingWallet === wallet.name
                  return (
                    <WalletButton
                      key={wallet.name}
                      icon={wallet.icon}
                      onClick={() => handleWalletClick(wallet.name)}
                      disabled={!!loadingWallet}
                      className={isLoading ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      {wallet.name}
                    </WalletButton>
                  )
                })}
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <span>{error}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <div className={isLoggingIn ? "pointer-events-none opacity-50" : ""}>
        <Footer />
      </div>
    </div>
  )
}
