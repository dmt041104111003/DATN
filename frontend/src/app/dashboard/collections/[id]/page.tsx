"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { Collection, Metadata } from '@/types/api'
import { CollectionMetadata } from '@/components/dashboard/collection-metadata'
import { LoadingPage } from '@/components/ui/loading'
import { DetailPageHeader } from '@/components/dashboard/detail-page-header'
import { InfoCard } from '@/components/dashboard/info-card'
import { NotFoundState } from '@/components/dashboard/not-found-state'
import { GatewayLink } from '@/components/ui/gateway-link'

export default function CollectionDetailPage() {
  const params = useParams()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [metadata, setMetadata] = useState<Metadata[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadCollection(params.id as string)
    }
  }, [params.id])

  const loadCollection = async (id: string, skipLoading = false) => {
    if (!skipLoading) {
      setLoading(true)
    }
    try {
      const [collectionData, metadataData] = await Promise.all([
        apiClient.collections.findOne(id),
        apiClient.metadata.findAll().catch(() => []),
      ])
      setCollection(collectionData)
      setMetadata(Array.isArray(metadataData) ? metadataData.filter(m => m.collectionId === id) : [])
    } catch {
      setCollection(null)
    } finally {
      if (!skipLoading) {
        setLoading(false)
      }
    }
  }

  if (loading) {
    return <LoadingPage />
  }

  if (!collection) {
    return (
      <NotFoundState
        message="Collection not found"
        backHref="/dashboard/collections"
        backLabel="Back to Collections"
      />
    )
  }

  const basicInfoItems = [
    { label: 'Name', value: collection.name },
    ...(collection.description ? [{ label: 'Description', value: collection.description }] : []),
    ...(collection.thumbnail ? [{
      label: 'Thumbnail',
      value: (
        <div className="mt-2">
          <GatewayLink url={collection.thumbnail} />
        </div>
      )
    }] : []),
  ]

  const timestampItems = [
    { label: 'Created At', value: new Date(collection.createdAt).toLocaleString() },
    { label: 'Updated At', value: new Date(collection.updatedAt).toLocaleString() },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <DetailPageHeader
        title={collection.name}
        description="Collection details"
        backHref="/dashboard/collections"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Basic Information" items={basicInfoItems} />
        <InfoCard title="Timestamps" items={timestampItems} />
      </div>

      <CollectionMetadata collectionId={collection.id} metadata={metadata} onRefresh={() => loadCollection(collection.id, true)} />
    </div>
  )
}
