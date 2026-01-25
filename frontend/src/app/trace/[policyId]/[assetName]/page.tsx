"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { LoadingPage } from '@/components/ui/loading'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TraceResult {
  product: {
    id: string
    name: string
    policyId: string
    assetName: string
    historyHash: string
    documents: any[]
    productionProcesses: any[]
    certifications: any[]
    warehouseStorages: any[]
    materials: any[]
    owner: string
    createdAt: string
    updatedAt: string
  } | null
  blockchain: {
    policyId: string
    assetName: string
    assetInfo: any
    onChainMetadata: any
  }
}

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
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Product Name</p>
                      <p className="font-semibold">{product.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Owner</p>
                      <p className="font-semibold font-mono text-sm">{product.owner}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created At</p>
                      <p className="font-semibold">{new Date(product.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">History Hash</p>
                      <p className="font-semibold font-mono text-xs break-all">{product.historyHash}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {product.documents && product.documents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Documents ({product.documents.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.documents.map((doc: any) => (
                          <TableRow key={doc.id}>
                            <TableCell>{doc.name}</TableCell>
                            <TableCell>{doc.type}</TableCell>
                            <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {product.certifications && product.certifications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Certifications ({product.certifications.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Issuer</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.certifications.map((cert: any) => (
                          <TableRow key={cert.id}>
                            <TableCell>{cert.name}</TableCell>
                            <TableCell>{cert.issuer}</TableCell>
                            <TableCell>{new Date(cert.issuedDate).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Location</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.materials.map((material: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{material.name}</TableCell>
                            <TableCell>{material.quantity} {material.unit}</TableCell>
                            <TableCell>{material.supplier?.name || 'N/A'}</TableCell>
                            <TableCell>{material.supplier?.location || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {product.warehouseStorages && product.warehouseStorages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Warehouse Storage ({product.warehouseStorages.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Warehouse</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Entry Date</TableHead>
                          <TableHead>Exit Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.warehouseStorages.map((storage: any) => (
                          <TableRow key={storage.id}>
                            <TableCell>{storage.warehouse?.name || 'N/A'}</TableCell>
                            <TableCell>{storage.warehouse?.location || 'N/A'}</TableCell>
                            <TableCell>{new Date(storage.entryDate).toLocaleDateString()}</TableCell>
                            <TableCell>{storage.exitDate ? new Date(storage.exitDate).toLocaleDateString() : 'Current'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
