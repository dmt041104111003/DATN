"use client"

import { useState } from 'react'
import { BrowserWallet } from '@meshsdk/core'
import { apiClient } from '@/lib/api/client'

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectWallet = async (walletName: string) => {
    setIsConnecting(true)
    setError(null)
    try {
      const walletInstance = await BrowserWallet.enable(walletName)
      const addresses = await walletInstance.getUsedAddresses()
      const walletAddress = addresses[0]
      if (!walletAddress) throw new Error('No address found')
      return { wallet: walletInstance, address: walletAddress }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
      throw err
    } finally {
      setIsConnecting(false)
    }
  }

  const login = async (wallet: BrowserWallet, address: string) => {
    setIsConnecting(true)
    setError(null)
    try {
      const userAddress = address.trim()
      const { nonce } = await apiClient.getNonce(userAddress)
      const signature = await wallet.signData(nonce, userAddress)
      return await apiClient.verifyWallet({
        address: userAddress,
        signature: signature.signature,
        key: signature.key,
      })
    } catch (err) {
      const isCancelled = err instanceof Error && 
        (err.message.includes('declined') || err.message.includes('rejected') || err.message.includes('cancelled'))
      setError(isCancelled ? 'Signing was cancelled. Please try again.' : err instanceof Error ? err.message : 'Login failed')
      throw err
    } finally {
      setIsConnecting(false)
    }
  }

  return { isConnecting, error, connectWallet, login }
}
