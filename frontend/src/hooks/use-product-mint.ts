import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { useWallet } from './use-wallet'
import { Product } from '@/types/api'

export function useProductMint(product: Product | null, user: { address: string; walletName?: string } | null, onSuccess: () => void) {
  const router = useRouter()
  const { connectWallet } = useWallet()
  const [minting, setMinting] = useState(false)
  const [mintError, setMintError] = useState<string | null>(null)
  const [mintStep, setMintStep] = useState<string>('')
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
      } else {
        alert(errorMessage)
      }
    }
  }

  const mint = async (assetName: string) => {
    if (!user?.address || !product || !assetName.trim()) {
      alert('Please enter asset name')
      return
    }
    setMinting(true)
    setMintError(null)
    setMintStep('Connecting wallet...')
    try {
      const selectedNetwork = (typeof window !== 'undefined' ? localStorage.getItem('selected_network') : 'preprod') || 'preprod'
      const { wallet } = await connectWallet(user.walletName || 'nami', selectedNetwork as 'mainnet' | 'preprod')
      setMintStep('Preparing metadata...')
      let metadata = preparedMetadata
      if (!metadata) {
        try {
          metadata = await apiClient.contract.prepareMetadata(product.id)
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to prepare metadata'
          if (errorMessage.includes('expired') || errorMessage.includes('Subscription')) {
            throw new Error(`${errorMessage}. Please renew your subscription to continue.`)
          }
          throw new Error(errorMessage)
        }
      }
      setMintStep('Creating transaction...')
      const response = await apiClient.contract.mint(user.address, [{
        assetName: assetName.trim(),
        metadata,
        quantity: '1',
      }])
      if (!response.result) {
        const errorMsg = response.message || 'Failed to create transaction'
        if (errorMsg.includes('already exists')) {
          throw new Error('This asset already exists on Blockchain. Please choose a different name.')
        } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
          throw new Error('Blockchain connection error. Please check your network connection and try again.')
        } else if (errorMsg.includes('expired') || errorMsg.includes('Subscription')) {
          throw new Error(`${errorMsg}. Please renew your subscription to continue.`)
        } else {
          throw new Error(`Transaction creation failed: ${errorMsg}`)
        }
      }
      setMintStep('Signing transaction...')
      const unsignedTx = response.data
      const signedTx = await wallet.signTx(unsignedTx)
      setMintStep('Submitting transaction to Blockchain...')
      const txHash = await wallet.submitTx(signedTx)
      setMintStep('Updating product information...')
      await apiClient.products.update(product.id, {
        assetName: assetName.trim(),
        policyId: (await apiClient.contract.getInfo(user.address)).policyId,
      })
      reset()
      onSuccess()
      alert(`NFT minted successfully! TX Hash: ${txHash}`)
    } catch (err) {
      const isCancelled = err instanceof Error && 
        ['declined', 'rejected', 'cancelled', 'User'].some(s => err.message.includes(s))
      if (!isCancelled) {
        let errorMessage = 'Failed to mint NFT'
        if (err instanceof Error) {
          if (err.message.includes('Blockchain connection')) {
            errorMessage = err.message
          } else if (err.message.includes('network') || err.message.includes('connection')) {
            errorMessage = 'Blockchain connection error. Please check your network connection and try again.'
          } else if (err.message.includes('expired') || err.message.includes('Subscription')) {
            errorMessage = err.message
            router.push('/dashboard/billing')
          } else {
            errorMessage = err.message
          }
        }
        setMintError(errorMessage)
      } else {
        setMintStep('Transaction cancelled')
      }
    } finally {
      setMinting(false)
      if (!mintError) {
        setMintStep('')
      }
    }
  }

  const reset = () => {
    setPreparedMetadata(null)
    setReviewMetadata(false)
    setMintError(null)
    setMintStep('')
  }

  return {
    minting,
    mintError,
    mintStep,
    preparedMetadata,
    reviewMetadata,
    prepareMetadata,
    mint,
    reset,
    setReviewMetadata,
    setPreparedMetadata,
  }
}
