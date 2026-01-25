"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Product, Document, Certification, ProductionProcess, ProductMaterial } from '@/types/api'
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
  const [loading, setLoading] = useState(true)
  const [minting, setMinting] = useState(false)
  const [mintOpen, setMintOpen] = useState(false)
  const [assetName, setAssetName] = useState('')

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
      const [productData, docsData, certsData, processesData, materialsData] = await Promise.all([
        apiClient.products.findOne(id),
        apiClient.documents.findAll().catch(() => []),
        apiClient.certifications.findAll().catch(() => []),
        apiClient.productionProcesses.findAll().catch(() => []),
        apiClient.productMaterials.findByProduct(id).catch(() => []),
      ])
      setProduct(productData)
      setDocuments(Array.isArray(docsData) ? docsData.filter(d => d.productId === id) : [])
      setCertifications(Array.isArray(certsData) ? certsData.filter(c => c.productId === id) : [])
      setProcesses(Array.isArray(processesData) ? processesData.filter(p => p.productId === id) : [])
      setProductMaterials(Array.isArray(materialsData) ? materialsData : [])
    } catch {
      setProduct(null)
    } finally {
      if (!skipLoading) {
        setLoading(false)
      }
    }
  }

  const handleMint = async () => {
    if (!user?.address || !product || !assetName.trim()) {
      alert('Please enter asset name')
      return
    }

    setMinting(true)
    try {
      const { wallet } = await connectWallet('nami')
      const metadata = {
        name: product.name,
        productId: product.id,
      }

      const response = await apiClient.contract.mint(user.address, [{
        assetName: assetName.trim(),
        metadata,
        quantity: '1',
      }])

      if (!response.result) {
        throw new Error(response.message)
      }

      const unsignedTx = response.data
      const signedTx = await wallet.signTx(unsignedTx)
      const txHash = await wallet.submitTx(signedTx)

      await apiClient.products.update(product.id, {
        assetName: assetName.trim(),
        policyId: (await apiClient.contract.getInfo(user.address)).policyId,
      })

      setMintOpen(false)
      setAssetName('')
      loadProduct(product.id)
      alert(`NFT minted successfully! TX: ${txHash}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mint NFT')
    } finally {
      setMinting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="h-8 bg-muted animate-pulse rounded w-48" />
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
      </div>
    )
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
          {!product.policyId && (
            <Dialog open={mintOpen} onOpenChange={setMintOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">Mint NFT</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mint Product as NFT</DialogTitle>
                  <DialogDescription>
                    Create an NFT for this product on Cardano blockchain
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="assetName">Asset Name</Label>
                    <Input
                      id="assetName"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      placeholder="Enter unique asset name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setMintOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleMint} disabled={minting}>
                    {minting ? 'Minting...' : 'Mint NFT'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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
                  {product.policyId && product.assetName ? (
                    <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-800 text-sm">
                      Minted
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800 text-sm">
                      Draft
                    </span>
                  )}
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
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ProductDocuments productId={product.id} documents={documents} onRefresh={() => loadProduct(product.id, true)} />
          <ProductCertifications productId={product.id} certifications={certifications} onRefresh={() => loadProduct(product.id, true)} />
          <ProductProcesses productId={product.id} processes={processes} onRefresh={() => loadProduct(product.id, true)} />
          <ProductMaterials productId={product.id} productMaterials={productMaterials} onRefresh={() => loadProduct(product.id, true)} />
        </div>
    </div>
  )
}
