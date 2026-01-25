"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Collection, Metadata } from '@/types/api'
import { CollectionMetadata } from '@/components/dashboard/collection-metadata'

export default function CollectionDetailPage() {
  const params = useParams()
  const router = useRouter()
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
    return (
      <div className="space-y-6">
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

  if (!collection) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Collection not found</p>
            <Button className="mt-4" onClick={() => router.push('/dashboard/collections')}>
              Back to Collections
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
        <div>
          <Button variant="ghost" onClick={() => router.push('/dashboard/collections')} className="mb-2">
            ← Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold mt-2 break-words">{collection.name}</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Collection details</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="mt-1">{collection.name}</p>
              </div>
              {collection.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1">{collection.description}</p>
                </div>
              )}
              {collection.thumbnail && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Thumbnail</label>
                  <img src={collection.thumbnail} alt={collection.name} className="mt-2 rounded w-full max-w-xs" />
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
                <p className="mt-1">{new Date(collection.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                <p className="mt-1">{new Date(collection.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

      <CollectionMetadata collectionId={collection.id} metadata={metadata} onRefresh={() => loadCollection(collection.id, true)} />
    </div>
  )
}
