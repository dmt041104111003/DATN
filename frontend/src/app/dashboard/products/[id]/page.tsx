"use client"

import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { StatusBadge } from '@/components/ui/status-badge'
import { LoadingPage } from '@/components/ui/loading'
import { DetailPageHeader } from '@/components/dashboard/shared/detail-page-header'
import { InfoCard } from '@/components/dashboard/shared/info-card'
import { NotFoundState } from '@/components/dashboard/shared/not-found-state'
import { MintDialog } from '@/components/dashboard/products/mint-dialog'
import { UpdateMetadataDialog } from '@/components/dashboard/products/update-metadata-dialog'
import { BurnDialog } from '@/components/dashboard/products/burn-dialog'
import { HistoryDialog } from '@/components/dashboard/products/history-dialog'
import { useProductData } from '@/hooks/use-product-data'

export default function ProductDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const productId = params.id as string

  const {
    product,
    loading,
    loadProduct,
  } = useProductData(productId)

  const handleRefresh = () => {
    loadProduct(productId, true)
  }

  if (loading) {
    return <LoadingPage />
  }

  if (!product) {
    return (
      <NotFoundState
        message="Product not found"
        backHref="/dashboard/products"
        backLabel="Back to Products"
      />
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <DetailPageHeader
            title={product.name}
            description="Product details"
            backHref="/dashboard/products"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {!product.policyId && (
            <MintDialog
              product={product}
              user={user}
              onSuccess={handleRefresh}
              trigger={<Button className="w-full sm:w-auto">Mint NFT</Button>}
            />
          )}
          {product.policyId && product.assetName && (
            <>
              <UpdateMetadataDialog
                product={product}
                user={user}
                onSuccess={handleRefresh}
                trigger={<Button variant="outline" className="w-full sm:w-auto">Update Metadata</Button>}
              />
              <BurnDialog
                product={product}
                user={user}
                onSuccess={handleRefresh}
                trigger={<Button variant="destructive" className="w-full sm:w-auto">Burn NFT</Button>}
              />
              <HistoryDialog
                productId={product.id}
                trigger={<Button variant="outline" className="w-full sm:w-auto">View History</Button>}
              />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard
          title="Basic Information"
          items={[
            { label: 'Name', value: product.name },
            { label: 'Status', value: <StatusBadge status={product.policyId && product.assetName ? 'Minted' : 'Draft'} /> },
            ...(product.policyId ? [{ label: 'Policy ID', value: <span className="font-mono text-xs sm:text-sm break-all overflow-x-auto">{product.policyId}</span> }] : []),
            ...(product.assetName ? [{ label: 'Asset Name', value: <span className="font-mono text-xs sm:text-sm break-all overflow-x-auto">{product.assetName}</span> }] : []),
            ...(product.historyHash ? [{ label: 'History Hash', value: <span className="font-mono text-xs sm:text-sm break-all overflow-x-auto">{product.historyHash}</span> }] : []),
          ]}
        />
        <InfoCard
          title="Timestamps"
          items={[
            { label: 'Created At', value: new Date(product.createdAt).toLocaleString() },
            { label: 'Updated At', value: new Date(product.updatedAt).toLocaleString() },
          ]}
        />
      </div>
    </div>
  )
}
