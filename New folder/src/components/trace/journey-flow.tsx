"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { RoadmapEntry, TraceBatch, TraceProduct } from "@/types"

interface JourneyFlowProps {
  roadmap: RoadmapEntry[]
  batch?: TraceBatch
  product?: TraceProduct | null
  business?: {
    id: string
    name?: string
    address?: string
    gpsCoordinates?: string
  }
  blockchain?: {
    policyId?: string
    assetName?: string
    mintTxHash?: string
  }
}

interface LeafletMapProps {
  roadmap: RoadmapEntry[]
  businessGps?: string
  businessName?: string
  currentStep?: number
  onMarkerClick: (entry: RoadmapEntry) => void
}

const LeafletMap = dynamic<LeafletMapProps>(
  () => import("./leaflet-map").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted/20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
)

export function JourneyFlow({ roadmap, batch, product, business, blockchain }: JourneyFlowProps) {
  const [selectedEntry, setSelectedEntry] = useState<RoadmapEntry | null>(null)

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return '0'
    return num.toLocaleString("en-US")
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + " at " + date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`
  }

  const formatGPS = (coords: string) => {
    const [lat, lng] = coords.split(",")
    return `${parseFloat(lat).toFixed(4)}°N, ${parseFloat(lng).toFixed(4)}°E`
  }

  const isOrigin = (entry: RoadmapEntry) => {
    return entry.id === 'origin' || entry.stepOrder === -1
  }

  if (!roadmap || roadmap.length === 0) return null

  return (
    <>
      <div className="w-full bg-card rounded-xl border overflow-hidden">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b">
          <div>
            <h2 className="font-semibold text-sm sm:text-base">{batch?.name || "Supply Chain Route"}</h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {roadmap.length} stops • Tap markers for details
            </p>
          </div>
        </div>

        <div className="relative h-[350px] sm:h-[450px]">
          <LeafletMap
            roadmap={roadmap}
            businessGps={business?.gpsCoordinates}
            businessName={business?.name || "Manufacturer"}
            currentStep={batch?.currentStep || 0}
            onMarkerClick={setSelectedEntry}
          />
        </div>

        <div className="p-3 sm:p-4 border-t flex flex-wrap items-center justify-center gap-3 sm:gap-5">
          <div className="flex items-center gap-1.5 text-xs">
            <svg viewBox="0 0 24 36" width="14" height="20">
              <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="#22c55e"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
            </svg>
            <span className="text-muted-foreground">Origin</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <svg viewBox="0 0 24 36" width="14" height="20">
              <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="#ea4335"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
            </svg>
            <span className="text-muted-foreground">Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <svg viewBox="0 0 24 36" width="14" height="20" style={{ opacity: 0.7 }}>
              <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="#f59e0b"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
            </svg>
            <span className="text-muted-foreground">Pending</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-5 h-1 rounded-full bg-[#22c55e]" />
            <span className="text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-5 h-0.5 rounded-full bg-[#f59e0b]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0px, #f59e0b 4px, transparent 4px, transparent 8px)' }} />
            <span className="text-muted-foreground">In Transit</span>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto mx-2 sm:mx-auto">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {isOrigin(selectedEntry) ? (selectedEntry.location || business?.name || "Manufacturer") : (selectedEntry.agent?.name || selectedEntry.location)}
                  <Badge variant={isOrigin(selectedEntry) ? "default" : selectedEntry.isCompleted ? "secondary" : "outline"} className="text-xs font-normal">
                    {isOrigin(selectedEntry) ? "Origin" : selectedEntry.isCompleted ? "Confirmed" : "Pending"}
                  </Badge>
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedEntry.agent?.location || selectedEntry.location || "Production Site"}
                </p>
              </DialogHeader>

              <div className="space-y-3">
                {!isOrigin(selectedEntry) && !selectedEntry.isCompleted ? (
                  <div className="text-center py-4 border rounded-lg bg-muted/30">
                    <p className="font-medium mb-1">Waiting for Confirmation</p>
                    <p className="text-sm text-muted-foreground">
                      This agent has not yet confirmed receipt.
                    </p>
                    {selectedEntry.gpsCoordinates && (
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        GPS: {formatGPS(selectedEntry.gpsCoordinates)}
                      </p>
                    )}
                  </div>
                ) : isOrigin(selectedEntry) ? (
                  <>
                    {batch && (
                      <div className="grid grid-cols-2 gap-3 text-center border rounded-lg p-3">
                        <div>
                          <p className="text-xl font-bold">{formatNumber(batch.initialQuantity)}</p>
                          <p className="text-xs text-muted-foreground">Produced</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold">{formatNumber(batch.currentQuantity)}</p>
                          <p className="text-xs text-muted-foreground">Remaining</p>
                        </div>
                      </div>
                    )}

                    {product && (
                      <div className="border rounded-lg divide-y text-sm">
                        <div className="p-2.5 bg-muted/30 font-medium">Product</div>
                        <div className="flex justify-between p-2.5">
                          <span className="text-muted-foreground">Name</span>
                          <span className="font-medium">{product.name}</span>
                        </div>
                        {product.description && (
                          <div className="p-2.5 text-xs text-muted-foreground">{product.description}</div>
                        )}
                      </div>
                    )}

                    {batch && (
                      <div className="border rounded-lg divide-y text-sm">
                        <div className="p-2.5 bg-muted/30 font-medium">Batch</div>
                        <div className="flex justify-between p-2.5">
                          <span className="text-muted-foreground">Name</span>
                          <span className="font-medium">{batch.name}</span>
                        </div>
                        <div className="flex justify-between p-2.5">
                          <span className="text-muted-foreground">ID</span>
                          <span className="font-mono text-xs">#{batch.id.slice(-8)}</span>
                        </div>
                        <div className="flex justify-between p-2.5">
                          <span className="text-muted-foreground">Quantity</span>
                          <span>{formatNumber(batch.currentQuantity)} / {formatNumber(batch.initialQuantity)} {batch.unit}</span>
                        </div>
                        {batch.productionDate && (
                          <div className="flex justify-between p-2.5">
                            <span className="text-muted-foreground">Produced</span>
                            <span>{formatShortDate(batch.productionDate)}</span>
                          </div>
                        )}
                        {batch.expiryDate && (
                          <div className="flex justify-between p-2.5">
                            <span className="text-muted-foreground">Expires</span>
                            <span>{formatShortDate(batch.expiryDate)}</span>
                          </div>
                        )}
                        <div className="flex justify-between p-2.5">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant="outline" className="text-xs">{batch.status}</Badge>
                        </div>
                      </div>
                    )}

                    {product?.materials && product.materials.length > 0 && (
                      <div className="border rounded-lg divide-y text-sm">
                        <div className="p-2.5 bg-muted/30 font-medium">Materials ({product.materials.length})</div>
                        {product.materials.map((mat, idx) => (
                          <div key={idx} className="p-2.5">
                            <div className="flex justify-between">
                              <span className="font-medium">{mat.name}</span>
                              <span className="text-muted-foreground">{formatNumber(mat.quantity)} {mat.unit}</span>
                            </div>
                            {mat.supplier?.name && (
                              <p className="text-xs text-muted-foreground mt-1">Supplier: {mat.supplier.name}</p>
                            )}
                            {mat.supplier?.location && (
                              <p className="text-xs text-muted-foreground">Origin: {mat.supplier.location}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {product?.certifications && product.certifications.length > 0 && (
                      <div className="border rounded-lg divide-y text-sm">
                        <div className="p-2.5 bg-muted/30 font-medium">Certifications ({product.certifications.length})</div>
                        {product.certifications.map((cert, idx) => (
                          <div key={idx} className="p-2.5">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{cert.name}</span>
                              <Badge variant="outline" className="text-xs">Valid</Badge>
                            </div>
                            {cert.issuer && <p className="text-xs text-muted-foreground mt-1">Issued by: {cert.issuer}</p>}
                            {cert.expiryDate && <p className="text-xs text-muted-foreground">Expires: {formatShortDate(cert.expiryDate)}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {blockchain && (
                      <div className="border rounded-lg divide-y text-sm">
                        <div className="p-2.5 bg-muted/30 font-medium">Blockchain (NFT)</div>
                        {blockchain.policyId && (
                          <div className="p-2.5">
                            <p className="text-xs text-muted-foreground">Policy ID</p>
                            <p className="font-mono text-xs break-all">{blockchain.policyId}</p>
                          </div>
                        )}
                        {blockchain.assetName && (
                          <div className="p-2.5">
                            <p className="text-xs text-muted-foreground">Asset Name</p>
                            <p className="font-mono text-xs">{blockchain.assetName}</p>
                          </div>
                        )}
                        {blockchain.mintTxHash && (
                          <div className="flex justify-between items-center p-2.5">
                            <span className="text-muted-foreground">Mint Tx</span>
                            <a
                              href={`https://preprod.cardanoscan.io/transaction/${blockchain.mintTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              {formatTxHash(blockchain.mintTxHash)} ↗
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {business && (
                      <div className="border rounded-lg divide-y text-sm">
                        <div className="p-2.5 bg-muted/30 font-medium">Manufacturer</div>
                        {business.name && (
                          <div className="flex justify-between p-2.5">
                            <span className="text-muted-foreground">Name</span>
                            <span className="font-medium">{business.name}</span>
                          </div>
                        )}
                        {business.address && (
                          <div className="p-2.5">
                            <p className="text-xs text-muted-foreground">Wallet Address</p>
                            <p className="font-mono text-xs break-all">{business.address}</p>
                          </div>
                        )}
                        {business.gpsCoordinates && (
                          <div className="flex justify-between p-2.5">
                            <span className="text-muted-foreground">GPS</span>
                            <span className="font-mono text-xs">{formatGPS(business.gpsCoordinates)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2 text-center border rounded-lg p-3">
                      <div>
                        <p className="text-xl font-bold">{formatNumber(selectedEntry.quantityIn)}</p>
                        <p className="text-xs text-muted-foreground">Received</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold">{formatNumber(selectedEntry.quantityOut)}</p>
                        <p className="text-xs text-muted-foreground">Shipped</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold">{formatNumber(selectedEntry.quantitySold)}</p>
                        <p className="text-xs text-muted-foreground">Sold</p>
                      </div>
                    </div>

                    {selectedEntry.agent && (
                      <div className="border rounded-lg divide-y text-sm">
                        <div className="p-2.5 bg-muted/30 font-medium">Agent Details</div>
                        <div className="flex justify-between p-2.5">
                          <span className="text-muted-foreground">Name</span>
                          <span className="font-medium">{selectedEntry.agent.name}</span>
                        </div>
                        {selectedEntry.agent.walletAddress && (
                          <div className="p-2.5">
                            <p className="text-xs text-muted-foreground">Wallet Address</p>
                            <p className="font-mono text-xs break-all">{selectedEntry.agent.walletAddress}</p>
                          </div>
                        )}
                        {selectedEntry.agent.location && (
                          <div className="flex justify-between p-2.5">
                            <span className="text-muted-foreground">Location</span>
                            <span>{selectedEntry.agent.location}</span>
                          </div>
                        )}
                        {selectedEntry.agent.gpsCoordinates && (
                          <div className="flex justify-between p-2.5">
                            <span className="text-muted-foreground">GPS</span>
                            <span className="font-mono text-xs">{formatGPS(selectedEntry.agent.gpsCoordinates)}</span>
                          </div>
                        )}
                        <div className="flex justify-between p-2.5">
                          <span className="text-muted-foreground">Step</span>
                          <span className="text-xs">#{selectedEntry.stepOrder + 1}</span>
                        </div>
                      </div>
                    )}

                    <div className="border rounded-lg divide-y text-sm">
                      <div className="p-2.5 bg-muted/30 font-medium">Confirmation</div>
                      <div className="flex justify-between p-2.5">
                        <span className="text-muted-foreground">Time</span>
                        <span>{formatDate(selectedEntry.completedAt || selectedEntry.timestamp)}</span>
                      </div>
                      {selectedEntry.confirmGps && (
                        <div className="flex justify-between p-2.5">
                          <span className="text-muted-foreground">GPS</span>
                          <span className="font-mono text-xs">{formatGPS(selectedEntry.confirmGps)}</span>
                        </div>
                      )}
                      {selectedEntry.confirmTxHash && (
                        <div className="flex justify-between items-center p-2.5">
                          <span className="text-muted-foreground">Tx Hash</span>
                          <a
                            href={`https://preprod.cardanoscan.io/transaction/${selectedEntry.confirmTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            {formatTxHash(selectedEntry.confirmTxHash)} ↗
                          </a>
                        </div>
                      )}
                    </div>

                    {batch && product && (
                      <div className="border rounded-lg divide-y text-sm">
                        <div className="p-2.5 bg-muted/30 font-medium">Batch</div>
                        <div className="flex justify-between p-2.5">
                          <span className="text-muted-foreground">Batch</span>
                          <span className="font-medium">{batch.name}</span>
                        </div>
                        <div className="flex justify-between p-2.5">
                          <span className="text-muted-foreground">Product</span>
                          <span>{product.name}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
