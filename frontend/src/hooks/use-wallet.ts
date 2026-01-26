"use client"

import { useState } from 'react'
import { BrowserWallet } from '@meshsdk/core'
import { authApi } from '@/lib/api/auth'

type Network = 'mainnet' | 'preprod'

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectWallet = async (walletName: string, selectedNetwork: Network) => {
    setIsConnecting(true)
    setError(null)
    try {
      const walletInstance = await BrowserWallet.enable(walletName)
      
      const walletNetworkId = await walletInstance.getNetworkId()
      const expectedNetworkId = selectedNetwork === 'mainnet' ? 1 : 0
      
      if (walletNetworkId !== expectedNetworkId) {
        const walletNetwork = walletNetworkId === 1 ? 'Mainnet' : 'Preprod'
        const expectedNetwork = selectedNetwork === 'mainnet' ? 'Mainnet' : 'Preprod'
        throw new Error(`Network mismatch: Your wallet is connected to ${walletNetwork}, but the app is configured for ${expectedNetwork}. Please switch your wallet network or select the correct network.`)
      }
      
      const addresses = await walletInstance.getUsedAddresses()
      const walletAddress = addresses[0]
      if (!walletAddress) throw new Error('No address found')
      return { wallet: walletInstance, address: walletAddress }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet'
      setError(message)
      throw new Error(message)
    } finally {
      setIsConnecting(false)
    }
  }

  const login = async (wallet: BrowserWallet, address: string, walletName: string) => {
    setIsConnecting(true)
    setError(null)
    try {
      const userAddress = address.trim()
      const { nonce } = await authApi.getNonce(userAddress)
      const signature = await wallet.signData(nonce, userAddress)
      return await authApi.verifyWallet({
        address: userAddress,
        signature: signature.signature,
        key: signature.key,
        walletName,
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
