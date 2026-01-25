"use client"

import { useState, useCallback } from 'react'
import { BrowserWallet } from '@meshsdk/core'
import { apiClient } from '@/lib/api/client'

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectWallet = useCallback(async (walletName: string) => {
    setIsConnecting(true)
    setError(null)

    try {
      const walletInstance = await BrowserWallet.enable(walletName)
      const addresses = await walletInstance.getUsedAddresses()
      const walletAddress = addresses[0]

      if (!walletAddress) {
        throw new Error('No address found')
      }

      return { wallet: walletInstance, address: walletAddress }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet'
      setError(errorMessage)
      throw err
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const login = useCallback(async (wallet: BrowserWallet, address: string) => {
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
      const errorMessage = err instanceof Error && (err.message.includes('declined') || err.message.includes('rejected') || err.message.includes('cancelled'))
        ? 'Signing was cancelled. Please try again.'
        : err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsConnecting(false)
    }
  }, [])

  return {
    isConnecting,
    error,
    connectWallet,
    login,
  }
}
