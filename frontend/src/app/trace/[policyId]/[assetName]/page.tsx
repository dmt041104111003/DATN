"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { productsApi } from '@/lib/api/products'
import { LoadingPage } from '@/components/ui/loading'
import { TraceResult } from '@/types/trace'
import { Certification } from '@/types/certification'
import { Material } from '@/types/material'

export default function TraceResultPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [result, setResult] = useState<TraceResult | null>(null)

  useEffect(() => {
    const policyId = params.policyId as string
    const assetName = params.assetName as string

    if (policyId && assetName) {
      loadTrace(decodeURIComponent(policyId), decodeURIComponent(assetName))
    }
  }, [params.policyId, params.assetName])

  const loadTrace = async (policyId: string, assetName: string) => {
    setLoading(true)
    setError('')

    try {
      const data = await productsApi.trace(policyId, assetName)
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Product not found or failed to load trace information')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <LoadingPage text="Tracing product..." />
        <Footer />
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 w-full">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-destructive">Product Not Found</h2>
                <p className="text-muted-foreground">{error || 'The product could not be traced with the provided information.'}</p>
                <Button onClick={() => router.push('/trace')}>Back to Trace</Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const { product, blockchain } = result

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 w-full">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Product Trace Result</h1>
              <p className="text-muted-foreground mt-2">
                Policy ID: {blockchain.policyId}
              </p>
              <p className="text-muted-foreground">
                Asset Name: {blockchain.assetName}
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/trace')}>
              Trace Another
            </Button>
          </div>

          {product ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div><span className="text-muted-foreground">Product Name: </span>{product.name}</div>
                    <div><span className="text-muted-foreground">Owner: </span><span className="font-mono text-sm">{product.owner}</span></div>
                    <div><span className="text-muted-foreground">Created At: </span>{new Date(product.createdAt).toLocaleDateString()}</div>
                    <div><span className="text-muted-foreground">History Hash: </span><span className="font-mono text-xs break-all">{product.historyHash}</span></div>
                  </div>
                </CardContent>
              </Card>

              {product.certifications && product.certifications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Certifications ({product.certifications.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {product.certifications.map((cert: Certification) => (
                        <div key={cert.id} className="border rounded p-2">
                          <div className="font-medium">{cert.certName}</div>
                          <div className="text-sm text-muted-foreground">
                            <div>Issue Date: {new Date(cert.issueDate).toLocaleDateString()}</div>
                            {cert.expiryDate && <div>Expiry Date: {new Date(cert.expiryDate).toLocaleDateString()}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {product.materials && product.materials.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Materials ({product.materials.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {product.materials.map((material: Material) => (
                        <div key={material.id} className="border rounded p-2">
                          <div className="font-medium">{material.name}</div>
                          <div className="text-sm text-muted-foreground">
                            <div>Quantity: {material.quantity || '-'}</div>
                            <div>Supplier: {material.supplier?.name || 'N/A'}</div>
                            {material.harvestDate && <div>Harvest Date: {new Date(material.harvestDate).toLocaleDateString()}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">Product Not Found in Database</h2>
                  <p className="text-muted-foreground">
                    The product was not found in our database, but blockchain information may be available.
                  </p>
                  {blockchain.assetInfo && (
                    <div className="mt-4 p-4 bg-muted rounded-lg text-left">
                      <p className="font-semibold mb-2">Blockchain Information:</p>
                      <pre className="text-xs overflow-auto">{JSON.stringify(blockchain.assetInfo, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {blockchain.onChainMetadata && (
            <Card>
              <CardHeader>
                <CardTitle>On-Chain Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto bg-muted p-4 rounded-lg">
                  {JSON.stringify(blockchain.onChainMetadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
