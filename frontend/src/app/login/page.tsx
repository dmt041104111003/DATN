"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BrowserWallet } from '@meshsdk/core'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { useWallet } from '@/hooks/use-wallet'
import { useAuth } from '@/contexts/auth-context'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function LoginPage() {
  const router = useRouter()
  const { error, connectWallet, login } = useWallet()
  const { refreshAuth } = useAuth()
  const [wallets, setWallets] = useState<ReturnType<typeof BrowserWallet.getInstalledWallets>>([])
  const [loadingWallet, setLoadingWallet] = useState<string | null>(null)

  useEffect(() => {
    try {
      setWallets(BrowserWallet.getInstalledWallets())
    } catch {
      setWallets([])
    }
  }, [])

  const handleWalletClick = async (walletName: string) => {
    if (loadingWallet) return
    
    setLoadingWallet(walletName)
    try {
      const result = await connectWallet(walletName)
      await login(result.wallet, result.address)
      await refreshAuth()
      router.refresh()
      router.push('/dashboard')
    } catch {} finally {
      setLoadingWallet(null)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {wallets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No Cardano wallet detected. Please install a wallet extension.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {wallets.map((wallet) => {
                  const isLoading = loadingWallet === wallet.name
                  return (
                    <Button
                      key={wallet.name}
                      variant="outline"
                      className="w-full justify-start gap-3 h-auto py-3"
                      onClick={() => handleWalletClick(wallet.name)}
                      disabled={!!loadingWallet}
                    >
                      {wallet.icon && (
                        <img src={wallet.icon} alt={wallet.name} className="w-5 h-5" />
                      )}
                      <span className="font-semibold">{wallet.name}</span>
                      {isLoading && <span className="text-sm ml-auto">Connecting...</span>}
                    </Button>
                  )
                })}
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <Icon name="error" size="sm" />
                  <span>{error}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
