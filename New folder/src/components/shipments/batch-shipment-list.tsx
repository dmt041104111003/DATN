"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { Batch, BatchStatus } from "@/types"

interface BatchShipmentListProps {
  batches: Batch[]
}

const statusColors: Record<BatchStatus, string> = {
  CREATED: "bg-gray-100 text-gray-800",
  MINTED: "bg-blue-100 text-blue-800",
  IN_TRANSIT: "bg-yellow-100 text-yellow-800",
  DELIVERED: "bg-green-100 text-green-800",
  SOLD_OUT: "bg-purple-100 text-purple-800",
}

export function BatchShipmentList({ batches }: BatchShipmentListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {batches.map((batch) => {
        const usedPercent = ((batch.initialQuantity - batch.currentQuantity) / batch.initialQuantity) * 100

        return (
          <Card key={batch.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{batch.name}</CardTitle>
                  <CardDescription className="font-mono text-xs">#{batch.id.slice(-8)}</CardDescription>
                </div>
                <Badge className={statusColors[batch.status]}>
                  {batch.status.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Quantity</span>
                  <span>
                    <span className="font-medium">{batch.currentQuantity}</span>
                    <span className="text-muted-foreground"> / {batch.initialQuantity} {batch.unit}</span>
                  </span>
                </div>
                <Progress value={usedPercent} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(usedPercent)}% distributed
                </p>
              </div>

              {batch._count && (
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Shipments: </span>
                    <span className="font-medium">{batch._count.shipments}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Movements: </span>
                    <span className="font-medium">{batch._count.movements}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/batches/${batch.id}`}>
                    <span className="material-symbols-outlined mr-1 text-base">visibility</span>
                    Details
                  </Link>
                </Button>
                {batch.policyId && batch.assetName && (
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/trace?policyId=${batch.policyId}&assetName=${batch.assetName}`}>
                      <span className="material-symbols-outlined mr-1 text-base">search</span>
                      Trace
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
