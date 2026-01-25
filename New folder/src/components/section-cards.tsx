"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Icon } from "@/components/ui/icon"
import { useMyProducts } from "@/hooks/use-products"
import { useBatches } from "@/hooks/use-batches"
import { useSuppliers } from "@/hooks/use-suppliers"
import { useAgents } from "@/hooks/use-agents"
import { usePendingShipments } from "@/hooks/use-shipments"
import { useAuthStore } from "@/stores/auth.store"
import { batchRepository } from "@/lib/api/batch.repository"
import type { MovementAction, TraceBatchResult, RoadmapEntry } from "@/types"

const LeafletMap = dynamic(
  () => import("@/components/trace/leaflet-map"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] rounded-xl border bg-background/50 backdrop-blur-sm flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading map...</span>
        </div>
      </div>
    ),
  }
)

const ACTION_ICONS: Record<MovementAction, string> = {
  PRODUCED: "factory",
  RECEIVED: "inventory",
  SHIPPED: "local_shipping",
  SOLD: "point_of_sale",
}

const ACTION_LABELS: Record<MovementAction, string> = {
  PRODUCED: "Produced",
  RECEIVED: "Received",
  SHIPPED: "Shipped",
  SOLD: "Sold",
}

export function SectionCards() {
  const { user } = useAuthStore()
  const isAgent = user?.role === "AGENT"

  const { data: products, isLoading: loadingProducts } = useMyProducts()
  const { data: batches, isLoading: loadingBatches } = useBatches()
  const { data: suppliers, isLoading: loadingSuppliers } = useSuppliers()
  const { data: agents, isLoading: loadingAgents } = useAgents()
  const { data: pendingShipments, isLoading: loadingPending } = usePendingShipments()

  const [selectedBatchId, setSelectedBatchId] = useState("")
  const [tracing, setTracing] = useState(false)
  const [traceError, setTraceError] = useState("")
  const [traceResult, setTraceResult] = useState<TraceBatchResult | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<RoadmapEntry | null>(null)

  const mintedBatches = batches?.filter(b => b.policyId && b.assetName) || []

  const formatNumber = (num: number) => num.toLocaleString("en-US")
  
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + " " + date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTxHash = (hash: string) => `${hash.slice(0, 8)}...${hash.slice(-8)}`
  
  const formatGPS = (coords: string) => {
    const [lat, lng] = coords.split(",")
    return `${parseFloat(lat).toFixed(4)}°N, ${parseFloat(lng).toFixed(4)}°E`
  }

  const handleBatchSelect = async (batchId: string) => {
    setSelectedBatchId(batchId)
    setTraceError("")
    
    if (!batchId) {
      setTraceResult(null)
      return
    }

    const batch = mintedBatches.find(b => b.id === batchId)
    if (!batch?.policyId || !batch?.assetName) return

    setTracing(true)
    try {
      const data = await batchRepository.trace(batch.policyId, batch.assetName)
      setTraceResult(data)
    } catch (err) {
      setTraceError(err instanceof Error ? err.message : "Unable to trace batch")
      setTraceResult(null)
    } finally {
      setTracing(false)
    }
  }

  const displayRoadmap = traceResult?.roadmap || []

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Stats Cards - different for each role */}
      {isAgent ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="relative">
              <CardDescription>Pending Shipments</CardDescription>
              {loadingPending ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <CardTitle className="text-3xl font-semibold tabular-nums">
                  {pendingShipments?.length ?? 0}
                </CardTitle>
              )}
              <Icon name="pending_actions" className="absolute right-4 top-4 text-muted-foreground" />
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="relative">
              <CardDescription>My Inventory</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">--</CardTitle>
              <Icon name="inventory" className="absolute right-4 top-4 text-muted-foreground" />
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="relative">
              <CardDescription>Total Sales</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">--</CardTitle>
              <Icon name="point_of_sale" className="absolute right-4 top-4 text-muted-foreground" />
            </CardHeader>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="relative">
              <CardDescription>Products</CardDescription>
              {loadingProducts ? <Skeleton className="h-8 w-16" /> : (
                <CardTitle className="text-3xl font-semibold tabular-nums">{products?.length ?? 0}</CardTitle>
              )}
              <Icon name="inventory_2" className="absolute right-4 top-4 text-muted-foreground" />
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="relative">
              <CardDescription>Batches</CardDescription>
              {loadingBatches ? <Skeleton className="h-8 w-16" /> : (
                <CardTitle className="text-3xl font-semibold tabular-nums">{batches?.length ?? 0}</CardTitle>
              )}
              <Icon name="layers" className="absolute right-4 top-4 text-muted-foreground" />
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="relative">
              <CardDescription>Agents</CardDescription>
              {loadingAgents ? <Skeleton className="h-8 w-16" /> : (
                <CardTitle className="text-3xl font-semibold tabular-nums">{agents?.length ?? 0}</CardTitle>
              )}
              <Icon name="groups" className="absolute right-4 top-4 text-muted-foreground" />
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="relative">
              <CardDescription>Suppliers</CardDescription>
              {loadingSuppliers ? <Skeleton className="h-8 w-16" /> : (
                <CardTitle className="text-3xl font-semibold tabular-nums">{suppliers?.length ?? 0}</CardTitle>
              )}
              <Icon name="factory" className="absolute right-4 top-4 text-muted-foreground" />
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Pending Shipments List - Agent only */}
      {isAgent && pendingShipments && pendingShipments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="local_shipping" size="sm" />
              Pending Shipments
            </CardTitle>
            <CardDescription>Shipments waiting for your confirmation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingShipments.slice(0, 5).map((shipment) => (
              <div key={shipment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{shipment.batch?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {shipment.quantity} {shipment.batch?.unit} • To: {shipment.destination}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    From: {shipment.batch?.business?.name || "Manufacturer"}
                  </div>
                </div>
                <Button asChild size="sm">
                  <Link href={`/inventory?confirm=${shipment.id}`}>Confirm</Link>
                </Button>
              </div>
            ))}
            {pendingShipments.length > 5 && (
              <Button variant="outline" className="w-full" asChild>
                <Link href="/inventory">View all {pendingShipments.length} pending shipments</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Product Traceability - Shared */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Product Traceability</CardTitle>
          <CardDescription>Search and track product journey</CardDescription>
        </CardHeader>
        <div className="p-4 pt-0 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedBatchId}
              onChange={(e) => handleBatchSelect(e.target.value)}
              className="flex-1 h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Select a minted batch...</option>
              {mintedBatches.map(batch => (
                <option key={batch.id} value={batch.id}>{batch.name}</option>
              ))}
            </select>
            {tracing && (
              <div className="h-10 px-4 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading...
              </div>
            )}
          </div>

          {traceError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
              <Icon name="error" size="sm" />
              {traceError}
            </div>
          )}

          {traceResult && (
            <div className="p-3 rounded-lg bg-primary/10 text-sm">
              <div className="font-medium">{traceResult.batch.name}</div>
              <div className="text-muted-foreground text-xs">{traceResult.roadmap.length} locations</div>
            </div>
          )}

          <div className="h-[400px] rounded-xl overflow-hidden border">
            {tracing ? (
              <div className="w-full h-full bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading route...</span>
                </div>
              </div>
            ) : (
              <LeafletMap
                roadmap={displayRoadmap}
                onMarkerClick={setSelectedEntry}
                actionIcons={ACTION_ICONS}
                actionLabels={ACTION_LABELS}
              />
            )}
          </div>
        </div>
      </Card>

      {/* Entry Detail Dialog - Shared */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto mx-2 sm:mx-auto">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedEntry.agent?.name || selectedEntry.location}
                  <Badge variant="outline" className="text-xs font-normal">
                    {selectedEntry.action === "PRODUCED" ? "Producer" : "Agent"}
                  </Badge>
                </DialogTitle>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <span className="material-icons text-sm">location_on</span>
                  {selectedEntry.agent?.location || selectedEntry.location}
                </p>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold">{formatNumber(selectedEntry.quantityIn)}</p>
                    <p className="text-xs text-muted-foreground">Received</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatNumber(selectedEntry.quantityOut)}</p>
                    <p className="text-xs text-muted-foreground">Shipped</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatNumber(selectedEntry.quantitySold)}</p>
                    <p className="text-xs text-muted-foreground">Sold</p>
                  </div>
                </div>

                <div className="border rounded-lg divide-y text-sm">
                  <div className="flex justify-between p-3">
                    <span className="text-muted-foreground">Timestamp</span>
                    <span className="font-medium">{formatDate(selectedEntry.timestamp)}</span>
                  </div>
                  {selectedEntry.gpsCoordinates && (
                    <div className="flex justify-between p-3">
                      <span className="text-muted-foreground">GPS</span>
                      <span className="font-mono text-xs">{formatGPS(selectedEntry.gpsCoordinates)}</span>
                    </div>
                  )}
                  {selectedEntry.txHash && (
                    <div className="flex justify-between items-center p-3">
                      <span className="text-muted-foreground">Blockchain</span>
                      <a
                        href={`https://cardanoscan.io/transaction/${selectedEntry.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                      >
                        {formatTxHash(selectedEntry.txHash)}
                        <span className="material-icons text-xs">open_in_new</span>
                      </a>
                    </div>
                  )}
                </div>

                {selectedEntry.action === "PRODUCED" && traceResult?.batch && (
                  <div className="border rounded-lg">
                    <div className="p-3 border-b bg-muted/30">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <span className="material-icons text-sm">inventory_2</span>
                        Batch Information
                      </h4>
                    </div>
                    <div className="divide-y text-sm">
                      <div className="flex justify-between p-3">
                        <span className="text-muted-foreground">Product</span>
                        <span className="font-medium">{traceResult.batch.name}</span>
                      </div>
                      <div className="flex justify-between p-3">
                        <span className="text-muted-foreground">Batch ID</span>
                        <span className="font-mono text-xs">{traceResult.batch.id.slice(-8)}</span>
                      </div>
                      <div className="flex justify-between p-3">
                        <span className="text-muted-foreground">Quantity</span>
                        <span>{formatNumber(traceResult.batch.currentQuantity)} / {formatNumber(traceResult.batch.initialQuantity)} {traceResult.batch.unit}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
