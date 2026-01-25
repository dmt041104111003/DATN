"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/stores/auth.store"
import { authRepository } from "@/lib/api/auth.repository"
import { useWalletDetection, useWalletConnect } from "@/hooks/use-wallet"
import { Icon } from "@/components/ui/icon"
import { WalletList } from "@/components/login/wallet-list"
import { NoWalletDetected } from "@/components/login/no-wallet"

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const { wallets, isDetecting } = useWalletDetection()
  const { enableWallet, signNonce, connecting, error, setError } = useWalletConnect()
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleConnect = async (walletId: string) => {
    setError(null)
    setIsLoggingIn(true)
    try {
      const wallet = await enableWallet(walletId)
      if (!wallet) return

      const nonceResponse = await authRepository.getNonce(wallet.address)
      const nonceData = nonceResponse as { nonce: string }
      const sign = await signNonce(walletId, wallet.hexAddress, nonceData.nonce)
      if (!sign) return

      const verifyResponse = await authRepository.verify(wallet.address, sign.signature, sign.key)
      const result = verifyResponse as { user: any }
      setUser(result.user, walletId)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err?.message || "Authentication failed")
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (isLoggingIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Signing in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-4">
      <div className="container mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <Icon name="arrow_back" size="sm" />
          Back to Home
        </Link>
      </div>
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center py-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4 px-4 sm:px-6">
            <Image src="/logo.svg" alt="Logo" width={48} height={48} className="mx-auto" />
            <div>
              <CardTitle className="text-xl sm:text-2xl">HSupply</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <Icon name="error" size="sm" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isDetecting ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : wallets.length === 0 ? (
              <NoWalletDetected />
            ) : (
              <WalletList
                wallets={wallets}
                connecting={connecting}
                onConnect={handleConnect}
              />
            )}
          </CardContent>
          <Separator />
          <CardFooter className="pt-6">
            <p className="text-center text-xs text-muted-foreground w-full">
              By connecting, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
