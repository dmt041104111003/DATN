"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Shipment, Batch } from "@/types"

interface ShipmentListProps {
  batches: Batch[]
}

export function ShipmentList({ batches }: ShipmentListProps) {
  const allShipments = batches
    .flatMap((batch) =>
      (batch.shipments || []).map((shipment) => ({
        ...shipment,
        batchName: batch.name,
        batchAssetName: batch.assetName,
      }))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (allShipments.length === 0) {
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
      case "IN_TRANSIT":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Transit</Badge>
      case "DELIVERED":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>
      case "CANCELLED":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Shipment History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allShipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-mono text-xs">{shipment.id.slice(0, 8)}...</TableCell>
                  <TableCell className="font-medium">{shipment.batchName}</TableCell>
                  <TableCell>{shipment.receiverAgent?.name || "N/A"}</TableCell>
                  <TableCell>{shipment.destination || "N/A"}</TableCell>
                  <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(shipment.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="md:hidden space-y-3">
          {allShipments.map((shipment) => (
            <div key={shipment.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{shipment.batchName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{shipment.id.slice(0, 8)}...</p>
                </div>
                {getStatusBadge(shipment.status)}
              </div>
              <div className="text-sm text-muted-foreground">
                <p>To: {shipment.receiverAgent?.name || "N/A"}</p>
                <p>Dest: {shipment.destination || "N/A"}</p>
                <p>{formatDate(shipment.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
