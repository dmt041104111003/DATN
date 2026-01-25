import { useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { useWallet } from './use-wallet'
import { Product } from '@/types/api'

export function useProductBurn(product: Product | null, user: { address: string; walletName?: string } | null, onSuccess: () => void) {
  const { connectWallet } = useWallet()
  const [burning, setBurning] = useState(false)
  const [burnError, setBurnError] = useState<string | null>(null)
  const [burnStep, setBurnStep] = useState<string>('')

  const burn = async (quantity: string) => {
    if (!user?.address || !product || !product.policyId || !product.assetName) {
      alert('Product must be minted before burning')
      return
    }

    if (!quantity || parseInt(quantity) <= 0) {
      alert('Please enter a valid quantity')
      return
    }

    setBurning(true)
    setBurnError(null)
    setBurnStep('Connecting wallet...')
    try {
      const selectedNetwork = (typeof window !== 'undefined' ? localStorage.getItem('selected_network') : 'preprod') || 'preprod'
      const { wallet } = await connectWallet(user.walletName || 'nami', selectedNetwork as 'mainnet' | 'preprod')
      
      setBurnStep('Creating burn transaction...')
      const response = await apiClient.contract.burn(user.address, [{
        assetName: product.assetName,
        quantity,
      }])

      if (!response.result) {
        const errorMsg = response.message || 'Failed to create burn transaction'
        if (errorMsg.includes('network') || errorMsg.includes('connection')) {
          throw new Error('Blockchain connection error. Please check your network connection and try again.')
        } else {
          throw new Error(`Transaction creation failed: ${errorMsg}`)
        }
      }

      setBurnStep('Signing transaction...')
      const unsignedTx = response.data
      const signedTx = await wallet.signTx(unsignedTx)
      
      setBurnStep('Submitting transaction to Blockchain...')
      const txHash = await wallet.submitTx(signedTx)

      reset()
      onSuccess()
      alert(`NFT burned successfully! TX Hash: ${txHash}`)
    } catch (err) {
      const isCancelled = err instanceof Error && 
        ['declined', 'rejected', 'cancelled', 'User'].some(s => err.message.includes(s))
      if (!isCancelled) {
        let errorMessage = 'Failed to burn NFT'
        if (err instanceof Error) {
          if (err.message.includes('Blockchain connection')) {
            errorMessage = err.message
          } else if (err.message.includes('network') || err.message.includes('connection')) {
            errorMessage = 'Blockchain connection error. Please check your network connection and try again.'
          } else {
            errorMessage = err.message
          }
        }
        setBurnError(errorMessage)
      } else {
        setBurnStep('Transaction cancelled')
      }
    } finally {
      setBurning(false)
      if (!burnError) {
        setBurnStep('')
      }
    }
  }

  const reset = () => {
    setBurnError(null)
    setBurnStep('')
  }

  return {
    burning,
    burnError,
    burnStep,
    burn,
    reset,
  }
}
