"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Icon } from "@/components/ui/icon"
import type { Batch, BatchStatus } from "@/types"

interface BatchListProps {
  batches: Batch[]
  onBurn?: (batch: Batch) => void
  onUpdate?: (batch: Batch) => void
}

const statusLabels: Record<BatchStatus, string> = {
  CREATED: "Created",
  MINTED: "Minted",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
  SOLD_OUT: "Sold Out",
}

export function BatchList({ batches, onBurn, onUpdate }: BatchListProps) {
  const formatDate = (date?: string) => {
    if (!date) return "-"
    const d = new Date(date)
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">All Batches ({batches.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Production</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-mono text-xs">{batch.id.slice(-8)}</TableCell>
                  <TableCell className="font-medium">{batch.name}</TableCell>
                  <TableCell>
                    <span className="font-medium">{batch.currentQuantity}</span>
                    <span className="text-muted-foreground">/{batch.initialQuantity} {batch.unit}</span>
                  </TableCell>
                  <TableCell>{statusLabels[batch.status]}</TableCell>
                  <TableCell className="text-sm">{formatDate(batch.productionDate)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {onUpdate && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onUpdate(batch)}
                          title="Update"
                        >
                          <Icon name="edit" size="sm" />
                        </Button>
                      )}
                      {onBurn && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onBurn(batch)}
                          className="text-destructive hover:text-destructive"
                          title="Burn & Delete"
                        >
                          <Icon name="local_fire_department" size="sm" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="lg:hidden space-y-3">
          {batches.map((batch) => (
            <div key={batch.id} className="border rounded-md p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">#{batch.id.slice(-8)}</span>
                    <span className="text-xs">{statusLabels[batch.status]}</span>
                  </div>
                  <p className="font-medium mt-1">{batch.name}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span>
                      <span className="font-medium">{batch.currentQuantity}</span>
                      <span className="text-muted-foreground">/{batch.initialQuantity} {batch.unit}</span>
                    </span>
                    {batch.productionDate && (
                      <span className="text-muted-foreground">
                        Prod: {formatDate(batch.productionDate)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {onUpdate && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onUpdate(batch)}
                      title="Update"
                    >
                      <Icon name="edit" size="sm" />
                    </Button>
                  )}
                      {onBurn && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onBurn(batch)}
                          className="text-destructive hover:text-destructive"
                          title="Burn & Delete"
                        >
                          <Icon name="local_fire_department" size="sm" />
                        </Button>
                      )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
