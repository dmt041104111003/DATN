"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { LoadingPage } from '@/components/ui/loading'
import { InfoCard } from '@/components/dashboard/shared/info-card'
import { ResponsiveListView } from '@/components/dashboard/shared/responsive-list-view'
import { TraceResult } from '@/types/trace'

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
      const data = await apiClient.products.trace(policyId, assetName)
      setResult(data)
    } catch (err: any) {
      setError(err?.message || 'Product not found or failed to load trace information')
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
              <InfoCard
                title="Product Information"
                items={[
                  { label: 'Product Name', value: product.name },
                  { label: 'Owner', value: <span className="font-mono text-sm">{product.owner}</span> },
                  { label: 'Created At', value: new Date(product.createdAt).toLocaleDateString() },
                  { label: 'History Hash', value: <span className="font-mono text-xs break-all">{product.historyHash}</span> },
                ]}
              />

              {product.documents && product.documents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Documents ({product.documents.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveListView
                      items={product.documents.map((doc: any) => ({ ...doc, id: doc.id || doc.name }))}
                      columns={[
                        { key: 'name', header: 'Name', render: (doc: any) => doc.name || doc.docType },
                        { key: 'type', header: 'Type', render: (doc: any) => doc.type || doc.docType },
                        { key: 'createdAt', header: 'Date', render: (doc: any) => new Date(doc.createdAt).toLocaleDateString() },
                      ]}
                      mobileCardTitle={(doc: any) => doc.name || doc.docType}
                      mobileCardDescription={(doc: any) => (
                        <span className="text-xs text-muted-foreground">
                          {doc.type || doc.docType} • {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {product.certifications && product.certifications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Certifications ({product.certifications.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveListView
                      items={product.certifications.map((cert: any) => ({ ...cert, id: cert.id || cert.certName }))}
                      columns={[
                        { key: 'name', header: 'Name', render: (cert: any) => cert.name || cert.certName },
                        { key: 'issuer', header: 'Issuer', render: (cert: any) => cert.issuer || '-' },
                        { key: 'issuedDate', header: 'Date', render: (cert: any) => new Date(cert.issuedDate || cert.issueDate).toLocaleDateString() },
                      ]}
                      mobileCardTitle={(cert: any) => cert.name || cert.certName}
                      mobileCardDescription={(cert: any) => (
                        <span className="text-xs text-muted-foreground">
                          {cert.issuer || '-'} • {new Date(cert.issuedDate || cert.issueDate).toLocaleDateString()}
                        </span>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {product.productionProcesses && product.productionProcesses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Production Processes ({product.productionProcesses.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {product.productionProcesses.map((process: any) => (
                        <div key={process.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{process.name}</h4>
                            {process.status && (
                              <span className="text-xs font-medium px-2 py-1 rounded bg-muted">{process.status}</span>
                            )}
                          </div>
                          {process.description && (
                            <p className="text-sm text-muted-foreground mb-2">{process.description}</p>
                          )}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Start:</span>{' '}
                              <span>{new Date(process.startDate).toLocaleDateString()}</span>
                            </div>
                            {process.endDate && (
                              <div>
                                <span className="text-muted-foreground">End:</span>{' '}
                                <span>{new Date(process.endDate).toLocaleDateString()}</span>
                              </div>
                            )}
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
                    <ResponsiveListView
                      items={product.materials.map((material: any, index: number) => ({ ...material, id: material.id || `material-${index}` }))}
                      columns={[
                        { key: 'name', header: 'Name', render: (m: any) => m.name },
                        { key: 'quantity', header: 'Quantity', render: (m: any) => `${m.quantity} ${m.unit || ''}` },
                        { key: 'supplier', header: 'Supplier', render: (m: any) => m.supplier?.name || 'N/A' },
                        { key: 'location', header: 'Location', render: (m: any) => m.supplier?.location || 'N/A' },
                      ]}
                      mobileCardTitle={(m: any) => m.name}
                      mobileCardDescription={(m: any) => (
                        <span className="text-xs text-muted-foreground">
                          {m.quantity} {m.unit || ''} • {m.supplier?.name || 'N/A'}
                        </span>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {product.warehouseStorages && product.warehouseStorages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Warehouse Storage ({product.warehouseStorages.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveListView
                      items={product.warehouseStorages.map((storage: any) => ({ ...storage, id: storage.id || `storage-${storage.warehouseId}` }))}
                      columns={[
                        { key: 'warehouse', header: 'Warehouse', render: (s: any) => s.warehouse?.name || 'N/A' },
                        { key: 'location', header: 'Location', render: (s: any) => s.warehouse?.location || 'N/A' },
                        { key: 'entryDate', header: 'Entry Date', render: (s: any) => new Date(s.entryDate || s.entryTime).toLocaleDateString() },
                        { key: 'exitDate', header: 'Exit Date', render: (s: any) => s.exitDate || s.exitTime ? new Date(s.exitDate || s.exitTime).toLocaleDateString() : 'Current' },
                      ]}
                      mobileCardTitle={(s: any) => s.warehouse?.name || 'N/A'}
                      mobileCardDescription={(s: any) => (
                        <span className="text-xs text-muted-foreground">
                          {s.warehouse?.location || 'N/A'} • Entry: {new Date(s.entryDate || s.entryTime).toLocaleDateString()}
                          {s.exitDate || s.exitTime ? ` • Exit: ${new Date(s.exitDate || s.exitTime).toLocaleDateString()}` : ' • Current'}
                        </span>
                      )}
                    />
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
