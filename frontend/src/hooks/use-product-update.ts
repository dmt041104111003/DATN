import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { useWallet } from './use-wallet'
import { Product } from '@/types/api'

export function useProductUpdate(product: Product | null, user: { address: string; walletName?: string } | null, onSuccess: () => void) {
  const router = useRouter()
  const { connectWallet } = useWallet()
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateStep, setUpdateStep] = useState<string>('')
  const [preparedMetadata, setPreparedMetadata] = useState<any>(null)
  const [reviewMetadata, setReviewMetadata] = useState(false)

  const prepareMetadata = async () => {
    if (!product) return
    
    try {
      const metadata = await apiClient.contract.prepareMetadata(product.id)
      setPreparedMetadata(metadata)
      setReviewMetadata(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to prepare metadata'
      if (errorMessage.includes('expired') || errorMessage.includes('Subscription')) {
        alert(`${errorMessage}. Please renew your subscription to continue.`)
        router.push('/dashboard/billing')
      } else if (errorMessage.includes('Not your product') || errorMessage.includes('permission')) {
        alert('You do not have permission to update this product.')
      } else {
        alert(errorMessage)
      }
    }
  }

  const update = async () => {
    if (!user?.address || !product || !product.policyId || !product.assetName) {
      alert('Product must be minted before updating metadata')
      return
    }

    setUpdating(true)
    setUpdateError(null)
    setUpdateStep('Connecting wallet...')
    try {
      const selectedNetwork = (typeof window !== 'undefined' ? localStorage.getItem('selected_network') : 'preprod') || 'preprod'
      const { wallet } = await connectWallet(user.walletName || 'nami', selectedNetwork as 'mainnet' | 'preprod')
      
      setUpdateStep('Preparing metadata...')
      let metadata = preparedMetadata
      if (!metadata) {
        try {
          metadata = await apiClient.contract.prepareMetadata(product.id)
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to prepare metadata'
          if (errorMessage.includes('expired') || errorMessage.includes('Subscription')) {
            throw new Error(`${errorMessage}. Please renew your subscription to continue.`)
          } else if (errorMessage.includes('Not your product') || errorMessage.includes('permission')) {
            throw new Error('You do not have permission to update this product.')
          }
          throw new Error(errorMessage)
        }
      }

      setUpdateStep('Creating update transaction...')
      const response = await apiClient.contract.update(user.address, [{
        assetName: product.assetName,
        metadata,
      }], product.id)

      if (!response.result) {
        const errorMsg = response.message || 'Failed to create update transaction'
        if (errorMsg.includes('not support') || errorMsg.includes('Asset') && errorMsg.includes('not found')) {
          throw new Error('Product does not support metadata updates. Asset not found on blockchain.')
        } else if (errorMsg.includes('Not your product') || errorMsg.includes('permission') || errorMsg.includes('Forbidden')) {
          throw new Error('You do not have permission to update this product.')
        } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
          throw new Error('Blockchain connection error. Please check your network connection and try again.')
        } else if (errorMsg.includes('expired') || errorMsg.includes('Subscription')) {
          throw new Error(`${errorMsg}. Please renew your subscription to continue.`)
        } else {
          throw new Error(`Update failed. Please try again later.`)
        }
      }

      setUpdateStep('Signing transaction...')
      const unsignedTx = response.data
      const signedTx = await wallet.signTx(unsignedTx)
      
      setUpdateStep('Submitting transaction to Blockchain...')
      const txHash = await wallet.submitTx(signedTx)

      reset()
      onSuccess()
      alert(`Metadata updated successfully! Transaction Hash: ${txHash}\n\nYou can view this transaction on the blockchain explorer.`)
    } catch (err) {
      const isCancelled = err instanceof Error && 
        ['declined', 'rejected', 'cancelled', 'User'].some(s => err.message.includes(s))
      if (!isCancelled) {
        let errorMessage = 'Failed to update metadata'
        if (err instanceof Error) {
          if (err.message.includes('Blockchain connection')) {
            errorMessage = err.message
          } else if (err.message.includes('not support') || err.message.includes('Asset') && err.message.includes('not found')) {
            errorMessage = 'Product does not support metadata updates. Asset not found on blockchain.'
          } else if (err.message.includes('Not your product') || err.message.includes('permission') || err.message.includes('Forbidden')) {
            errorMessage = 'You do not have permission to update this product.'
          } else if (err.message.includes('network') || err.message.includes('connection')) {
            errorMessage = 'Blockchain connection error. Please check your network connection and try again.'
          } else if (err.message.includes('expired') || err.message.includes('Subscription')) {
            errorMessage = err.message
            router.push('/dashboard/billing')
          } else {
            errorMessage = err.message || 'Update failed. Please try again later.'
          }
        }
        setUpdateError(errorMessage)
      } else {
        setUpdateStep('Transaction cancelled')
      }
    } finally {
      setUpdating(false)
      if (!updateError) {
        setUpdateStep('')
      }
    }
  }

  const reset = () => {
    setPreparedMetadata(null)
    setReviewMetadata(false)
    setUpdateError(null)
    setUpdateStep('')
  }

  return {
    updating,
    updateError,
    updateStep,
    preparedMetadata,
    reviewMetadata,
    prepareMetadata,
    update,
    reset,
    setReviewMetadata,
    setPreparedMetadata,
  }
}
