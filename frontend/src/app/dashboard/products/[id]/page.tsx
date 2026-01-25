"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Product, Document, Certification, ProductionProcess, ProductMaterial, WarehouseStorage } from '@/types/api'
import { useAuth } from '@/contexts/auth-context'
import { useWallet } from '@/hooks/use-wallet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProductDocuments } from '@/components/dashboard/product-documents'
import { ProductCertifications } from '@/components/dashboard/product-certifications'
import { ProductProcesses } from '@/components/dashboard/product-processes'
import { ProductMaterials } from '@/components/dashboard/product-materials'
import { ProductWarehouseStorages } from '@/components/dashboard/product-warehouse-storages'
import { StatusBadge } from '@/components/ui/status-badge'
import { LoadingPage } from '@/components/ui/loading'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { connectWallet } = useWallet()
  const [product, setProduct] = useState<Product | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [processes, setProcesses] = useState<ProductionProcess[]>([])
  const [productMaterials, setProductMaterials] = useState<ProductMaterial[]>([])
  const [warehouseStorages, setWarehouseStorages] = useState<WarehouseStorage[]>([])
  const [loading, setLoading] = useState(true)
  const [minting, setMinting] = useState(false)
  const [mintOpen, setMintOpen] = useState(false)
  const [assetName, setAssetName] = useState('')
  const [burning, setBurning] = useState(false)
  const [burnOpen, setBurnOpen] = useState(false)
  const [burnQuantity, setBurnQuantity] = useState('1')
  const [updating, setUpdating] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [mintError, setMintError] = useState<string | null>(null)
  const [burnError, setBurnError] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [mintStep, setMintStep] = useState<string>('')
  const [burnStep, setBurnStep] = useState<string>('')
  const [updateStep, setUpdateStep] = useState<string>('')
  const [preparedMetadata, setPreparedMetadata] = useState<any>(null)
  const [reviewMetadata, setReviewMetadata] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string)
    }
  }, [params.id])

  const loadProduct = async (id: string, skipLoading = false) => {
    if (!skipLoading) {
      setLoading(true)
    }
    try {
      const [productData, docsData, certsData, processesData, materialsData, storagesData] = await Promise.all([
        apiClient.products.findOne(id),
        apiClient.documents.findAll().catch(() => []),
        apiClient.certifications.findAll().catch(() => []),
        apiClient.productionProcesses.findAll().catch(() => []),
        apiClient.productMaterials.findByProduct(id).catch(() => []),
        apiClient.warehouseStorages.findAll().catch(() => []),
      ])
      setProduct(productData)
      setDocuments(Array.isArray(docsData) ? docsData.filter(d => d.productId === id) : [])
      setCertifications(Array.isArray(certsData) ? certsData.filter(c => c.productId === id) : [])
      setProcesses(Array.isArray(processesData) ? processesData.filter(p => p.productId === id) : [])
      setProductMaterials(Array.isArray(materialsData) ? materialsData : [])
      setWarehouseStorages(Array.isArray(storagesData) ? storagesData.filter(s => s.productId === id) : [])
    } catch {
      setProduct(null)
    } finally {
      if (!skipLoading) {
        setLoading(false)
      }
    }
  }

  const handlePrepareMetadata = async () => {
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

  const handleMint = async () => {
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

      setMintOpen(false)
      setAssetName('')
      setMintStep('')
      setPreparedMetadata(null)
      setReviewMetadata(false)
      loadProduct(product.id)
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

  const handleBurn = async () => {
    if (!user?.address || !product || !product.policyId || !product.assetName) {
      alert('Product must be minted before burning')
      return
    }

    if (!burnQuantity || parseInt(burnQuantity) <= 0) {
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
        quantity: burnQuantity,
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

      setBurnOpen(false)
      setBurnQuantity('1')
      setBurnStep('')
      loadProduct(product.id)
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

  const handleUpdateMetadata = async () => {
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

      setUpdateOpen(false)
      setUpdateStep('')
      setPreparedMetadata(null)
      setReviewMetadata(false)
      loadProduct(product.id)
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

  const loadHistory = async () => {
    if (!product?.id) return
    setLoadingHistory(true)
    try {
      const data = await apiClient.products.getHistory(product.id)
      setHistory(Array.isArray(data.history) ? data.history : [])
    } catch (err) {
      setHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (historyOpen && product?.policyId && product?.assetName) {
      loadHistory()
    }
  }, [historyOpen, product?.id])

  if (loading) {
    return <LoadingPage />
  }

  if (!product) {
    return (
      <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Product not found</p>
              <Button className="mt-4" onClick={() => router.push('/dashboard/products')}>
                Back to Products
              </Button>
            </CardContent>
          </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <Button variant="ghost" onClick={() => router.push('/dashboard/products')} className="mb-2">
              ← Back
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2 break-words">{product.name}</h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Product details</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!product.policyId && (
              <Dialog open={mintOpen} onOpenChange={setMintOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">Mint NFT</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Mint Product as NFT</DialogTitle>
                    <DialogDescription>
                      Create an NFT for this product on Cardano blockchain
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="assetName">Asset Name *</Label>
                      <Input
                        id="assetName"
                        value={assetName}
                        onChange={(e) => setAssetName(e.target.value)}
                        placeholder="Enter unique asset name"
                        disabled={minting}
                      />
                      <p className="text-xs text-muted-foreground">This name must be unique on the blockchain</p>
                    </div>
                    {!reviewMetadata && !preparedMetadata && (
                      <div className="grid gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handlePrepareMetadata}
                          disabled={minting}
                        >
                          Review Metadata
                        </Button>
                        <p className="text-xs text-muted-foreground">Review product information that will be stored on blockchain</p>
                      </div>
                    )}
                    {reviewMetadata && preparedMetadata && (
                      <div className="grid gap-4 border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Metadata Preview</h4>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setReviewMetadata(false)
                              setPreparedMetadata(null)
                            }}
                          >
                            Hide
                          </Button>
                        </div>
                        <div className="grid gap-3 text-sm">
                          <div>
                            <span className="font-medium">Name: </span>
                            <span>{preparedMetadata.name}</span>
                          </div>
                          {preparedMetadata.documents && preparedMetadata.documents.length > 0 && (
                            <div>
                              <span className="font-medium">Documents: </span>
                              <span>{preparedMetadata.documents.length} document(s)</span>
                            </div>
                          )}
                          {preparedMetadata.materials && preparedMetadata.materials.length > 0 && (
                            <div>
                              <span className="font-medium">Materials: </span>
                              <span>{preparedMetadata.materials.length} material(s)</span>
                            </div>
                          )}
                          {preparedMetadata.productionProcesses && preparedMetadata.productionProcesses.length > 0 && (
                            <div>
                              <span className="font-medium">Production Processes: </span>
                              <span>{preparedMetadata.productionProcesses.length} process(es)</span>
                            </div>
                          )}
                          {preparedMetadata.certifications && preparedMetadata.certifications.length > 0 && (
                            <div>
                              <span className="font-medium">Certifications: </span>
                              <span>{preparedMetadata.certifications.length} certification(s)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {mintStep && (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      {mintStep}
                    </div>
                  )}
                  {mintError && (
                    <div className="px-4 py-2 text-sm text-destructive">
                      {mintError}
                    </div>
                  )}
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => { 
                        setMintOpen(false)
                        setMintError(null)
                        setMintStep('')
                        setPreparedMetadata(null)
                        setReviewMetadata(false)
                      }} 
                      disabled={minting}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleMint} disabled={minting || !assetName.trim()}>
                      {minting ? 'Processing...' : 'Mint NFT'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            {product.policyId && product.assetName && (
              <>
                <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">Update Metadata</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Update NFT Metadata</DialogTitle>
                      <DialogDescription>
                        Update the metadata of this NFT on the blockchain
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <p className="text-sm text-muted-foreground">
                        This will update the on-chain metadata with current product information.
                      </p>
                      {!reviewMetadata && !preparedMetadata && (
                        <div className="grid gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handlePrepareMetadata}
                            disabled={updating}
                          >
                            Review Metadata
                          </Button>
                          <p className="text-xs text-muted-foreground">Review product information that will be updated on blockchain</p>
                        </div>
                      )}
                      {reviewMetadata && preparedMetadata && (
                        <div className="grid gap-4 border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Metadata Preview</h4>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setReviewMetadata(false)
                                setPreparedMetadata(null)
                              }}
                            >
                              Hide
                            </Button>
                          </div>
                          <div className="grid gap-3 text-sm">
                            <div>
                              <span className="font-medium">Name: </span>
                              <span>{preparedMetadata.name}</span>
                            </div>
                            {preparedMetadata.documents && preparedMetadata.documents.length > 0 && (
                              <div>
                                <span className="font-medium">Documents: </span>
                                <span>{preparedMetadata.documents.length} document(s)</span>
                              </div>
                            )}
                            {preparedMetadata.materials && preparedMetadata.materials.length > 0 && (
                              <div>
                                <span className="font-medium">Materials: </span>
                                <span>{preparedMetadata.materials.length} material(s)</span>
                              </div>
                            )}
                            {preparedMetadata.productionProcesses && preparedMetadata.productionProcesses.length > 0 && (
                              <div>
                                <span className="font-medium">Production Processes: </span>
                                <span>{preparedMetadata.productionProcesses.length} process(es)</span>
                              </div>
                            )}
                            {preparedMetadata.certifications && preparedMetadata.certifications.length > 0 && (
                              <div>
                                <span className="font-medium">Certifications: </span>
                                <span>{preparedMetadata.certifications.length} certification(s)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {updateStep && (
                      <div className="px-4 py-2 text-sm text-muted-foreground">
                        {updateStep}
                      </div>
                    )}
                    {updateError && (
                      <div className="px-4 py-2 text-sm text-destructive">
                        {updateError}
                      </div>
                    )}
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => { 
                          setUpdateOpen(false)
                          setUpdateError(null)
                          setUpdateStep('')
                          setPreparedMetadata(null)
                          setReviewMetadata(false)
                        }}
                        disabled={updating}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateMetadata} disabled={updating}>
                        {updating ? 'Processing...' : 'Update Metadata'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog open={burnOpen} onOpenChange={setBurnOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">Burn NFT</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Burn NFT</DialogTitle>
                      <DialogDescription>
                        Permanently destroy this NFT from the blockchain
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="burnQuantity">Quantity</Label>
                        <Input
                          id="burnQuantity"
                          type="number"
                          min="1"
                          value={burnQuantity}
                          onChange={(e) => setBurnQuantity(e.target.value)}
                          placeholder="1"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the quantity of NFTs to burn
                        </p>
                      </div>
                    </div>
                    {burnStep && (
                      <div className="px-4 py-2 text-sm text-muted-foreground">
                        {burnStep}
                      </div>
                    )}
                    {burnError && (
                      <div className="px-4 py-2 text-sm text-destructive">
                        {burnError}
                      </div>
                    )}
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => { setBurnOpen(false); setBurnError(null); setBurnStep('') }}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleBurn} disabled={burning}>
                        {burning ? 'Processing...' : 'Burn NFT'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">View History</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Transaction History</DialogTitle>
                      <DialogDescription>
                        View all blockchain transactions for this NFT
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      {loadingHistory ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Loading history...</p>
                      ) : history.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No transaction history found</p>
                      ) : (
                        <div className="space-y-2">
                          {history.map((tx, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Transaction {index + 1}</span>
                                <span className="text-xs text-muted-foreground">{tx.action || 'Unknown'}</span>
                              </div>
                              <div className="space-y-1 text-xs">
                                <div>
                                  <span className="text-muted-foreground">TX Hash: </span>
                                  <span className="font-mono break-all">{tx.txHash}</span>
                                </div>
                                {tx.amount && (
                                  <div>
                                    <span className="text-muted-foreground">Amount: </span>
                                    <span>{tx.amount}</span>
                                  </div>
                                )}
                                {tx.blockTime && (
                                  <div>
                                    <span className="text-muted-foreground">Time: </span>
                                    <span>{new Date(tx.blockTime * 1000).toLocaleString()}</span>
                                  </div>
                                )}
                                {tx.blockHeight && (
                                  <div>
                                    <span className="text-muted-foreground">Block: </span>
                                    <span>{tx.blockHeight}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setHistoryOpen(false)}>
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        {/* <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="mt-1">{product.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="mt-1">
                  <StatusBadge status={product.policyId && product.assetName ? 'Minted' : 'Draft'} />
                </p>
              </div>
              {product.policyId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Policy ID</label>
                  <p className="mt-1 font-mono text-xs sm:text-sm break-all overflow-x-auto">{product.policyId}</p>
                </div>
              )}
              {product.assetName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Asset Name</label>
                  <p className="mt-1 font-mono text-xs sm:text-sm break-all overflow-x-auto">{product.assetName}</p>
                </div>
              )}
              {product.historyHash && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">History Hash</label>
                  <p className="mt-1 font-mono text-xs sm:text-sm break-all overflow-x-auto">{product.historyHash}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="mt-1">{new Date(product.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                <p className="mt-1">{new Date(product.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div> */}

        <div className="grid gap-4 md:grid-cols-2">
          <ProductDocuments productId={product.id} documents={documents} onRefresh={() => loadProduct(product.id, true)} />
          <ProductCertifications productId={product.id} certifications={certifications} onRefresh={() => loadProduct(product.id, true)} />
          <ProductProcesses productId={product.id} processes={processes} onRefresh={() => loadProduct(product.id, true)} />
          <ProductMaterials productId={product.id} productMaterials={productMaterials} onRefresh={() => loadProduct(product.id, true)} />
          <ProductWarehouseStorages productId={product.id} storages={warehouseStorages} onRefresh={() => loadProduct(product.id, true)} />
        </div>
    </div>
  )
}
