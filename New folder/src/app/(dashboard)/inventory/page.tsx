"use client"

import { useState } from "react"
import { usePendingShipments, useUpdateShipment } from "@/hooks/use-shipments"
import { contractRepository } from "@/lib/api/contract.repository"
import { useWalletConnect } from "@/hooks/use-wallet"
import { useAuthStore } from "@/stores/auth.store"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/dashboard/empty-state"
import { LoadingState } from "@/components/dashboard/loading-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Shipment } from "@/types"

export default function InventoryPage() {
  const { data: shipments, isLoading, error, refetch } = usePendingShipments()
  const updateShipment = useUpdateShipment()
  const { signTx } = useWalletConnect()
  const { user, walletId } = useAuthStore()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const handleConfirm = async (shipment: Shipment) => {
    if (!user?.address || !walletId) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!shipment.batch?.assetName || !shipment.batch?.business?.address) {
      toast.error("Shipment missing required information")
      return
    }

    setConfirmingId(shipment.id)

    try {
      // Get GPS location
      let confirmGps = ""
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          })
        })
        confirmGps = `${position.coords.latitude},${position.coords.longitude}`
        toast.info(`GPS captured: ${confirmGps}`)
      } catch (gpsError) {
        toast.warning("Could not get GPS location. Continuing without it.")
      }

      // Get current step and metadata from batch
      const currentStep = shipment.batch.currentStep || 0
      const metadata = shipment.batch.metadata || {}

      toast.info("Creating blockchain transaction...")
      const txResponse = await contractRepository.agentConfirmShipment(
        user.address,
        {
          assetName: shipment.batch.assetName,
          receiverAddress: user.address,
          quantity: String(shipment.quantity),
          issuer: shipment.batch.business.address,
          currentStep,
          metadata,
          confirmGps,
        }
      )

      if (!txResponse.result || !txResponse.data) {
        toast.error(txResponse.message || "Failed to create transaction")
        return
      }

      toast.info("Please sign the transaction in your wallet...")
      const signedTx = await signTx(walletId, txResponse.data.unsignedTx)

      toast.info("Submitting to blockchain...")
      const submitResponse = await contractRepository.submitTx(signedTx)

      if (!submitResponse.result) {
        toast.error(submitResponse.message || "Failed to submit transaction")
        return
      }

      const txHash = submitResponse.data as string
      toast.info("Saving confirmation...")

      await updateShipment.mutateAsync({
        id: shipment.id,
        data: {
          status: 'DELIVERED',
          confirmTxHash: txHash,
        },
      })

      toast.success("Shipment confirmed! TxHash: " + txHash.slice(0, 16) + "...")
      refetch()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to confirm shipment"
      if (message.includes("cancelled")) {
        toast.info("Transaction cancelled")
      } else {
        toast.error(message)
      }
    } finally {
      setConfirmingId(null)
    }
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

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <PageHeader 
        title="My Inventory" 
        description="Products you have received from shipments"
      />

      {!shipments || shipments.length === 0 ? (
        <EmptyState
          icon="inventory_2"
          message="No inventory yet"
          description="Confirm shipments to add products to your inventory."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pending Shipments ({shipments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Name</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>TxHash</TableHead>
                    <TableHead className="w-[150px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">
                        {shipment.batch?.name || "Unknown Batch"}
                      </TableCell>
                      <TableCell>
                        {shipment.senderAgent?.name || shipment.batch?.business?.name || "Manufacturer"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {shipment.destination}
                      </TableCell>
                      <TableCell>
                        {shipment.quantity} {shipment.batch?.unit || ""}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(shipment.status)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(shipment.createdAt)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {shipment.createTxHash ? (
                          <span className="text-muted-foreground">
                            {shipment.createTxHash.slice(0, 12)}...
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {(shipment.status === "PENDING" || shipment.status === "IN_TRANSIT") ? (
                          <Button
                            onClick={() => handleConfirm(shipment)}
                            disabled={confirmingId === shipment.id || updateShipment.isPending}
                            size="sm"
                            className="w-full"
                          >
                            {confirmingId === shipment.id ? "Confirming..." : "Confirm"}
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile view - cards */}
            <div className="md:hidden space-y-4">
              {shipments.map((shipment) => (
                <Card key={shipment.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{shipment.batch?.name || "Unknown Batch"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="font-medium">From:</span>{" "}
                        {shipment.senderAgent?.name || shipment.batch?.business?.name || "Manufacturer"}
                      </div>
                      <div>
                        <span className="font-medium">Destination:</span> {shipment.destination}
                      </div>
                      <div>
                        <span className="font-medium">Quantity:</span> {shipment.quantity} {shipment.batch?.unit || ""}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span> {getStatusBadge(shipment.status)}
                      </div>
                      {shipment.createTxHash && (
                        <div className="text-xs text-muted-foreground">
                          TxHash: {shipment.createTxHash.slice(0, 16)}...
                        </div>
                      )}
                    </div>
                    {(shipment.status === "PENDING" || shipment.status === "IN_TRANSIT") && (
                      <Button
                        onClick={() => handleConfirm(shipment)}
                        disabled={confirmingId === shipment.id || updateShipment.isPending}
                        className="w-full"
                      >
                        {confirmingId === shipment.id ? "Confirming..." : "Confirm Receipt"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
