"use client"

import { useState } from "react"
import { useBatches } from "@/hooks/use-batches"
import { useCreateShipment } from "@/hooks/use-shipments"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/dashboard/empty-state"
import { LoadingState } from "@/components/dashboard/loading-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { ShipmentForm } from "@/components/shipments/shipment-form"
import { ShipmentList } from "@/components/shipments/shipment-list"
import { contractRepository } from "@/lib/api/contract.repository"
import { useWalletConnect } from "@/hooks/use-wallet"
import { useAuthStore } from "@/stores/auth.store"
import type { CreateShipmentInput } from "@/types"

function extractUnsignedTx(data: unknown): string | null {
  if (typeof data === 'string') {
    return data
  }
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (typeof obj.unsignedTx === 'string') {
      return obj.unsignedTx
    }
  }
  return null
}

export default function ShipmentsPage() {
  const { data: batches, isLoading: batchesLoading, error: batchesError, refetch } = useBatches()
  const createShipment = useCreateShipment()
  const { signTx } = useWalletConnect()
  const { user, walletId } = useAuthStore()

  const [open, setOpen] = useState(false)
  const [signing, setSigning] = useState(false)
  const [formData, setFormData] = useState<CreateShipmentInput>({
    batchId: "",
    receiverAgentId: "",
    destination: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.address || !walletId) {
      toast.error("Please connect your wallet first")
      return
    }

    const selectedBatch = batches?.find((b) => b.id === formData.batchId)
    if (!selectedBatch?.assetName) {
      toast.error("Selected batch has no NFT")
      return
    }

    if (!selectedBatch.business?.address) {
      toast.error("Batch has no business address")
      return
    }

    const nextStep = selectedBatch.roadmap?.find(
      (r) => r.stepOrder === (selectedBatch.currentStep || 0)
    )
    if (!nextStep?.agent) {
      toast.error("No next agent in roadmap")
      return
    }

    setSigning(true)
    const quantity = selectedBatch.currentQuantity

    try {
      let senderGps = ""
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          })
        })
        senderGps = `${position.coords.latitude},${position.coords.longitude}`
        toast.info(`GPS captured: ${senderGps}`)
      } catch (gpsError) {
        toast.warning("Could not get GPS location. Continuing without it.")
      }

      toast.info("Creating blockchain transaction...")
      const txResponse = await contractRepository.shipBatch(selectedBatch.business.address, {
        assetName: selectedBatch.assetName,
        receiverAgent: nextStep.agent.address,
        destination: nextStep.agent.location || "",
        quantity: String(quantity),
        senderGps,
      })

      console.log("[Shipment] Transaction response:", txResponse)

      if (!txResponse.result || !txResponse.data) {
        console.error("[Shipment] Invalid transaction response:", txResponse)
        toast.error(txResponse.message || "Failed to create transaction")
        return
      }

      const unsignedTx = extractUnsignedTx(txResponse.data)

      if (!unsignedTx) {
        console.error("[Shipment] No unsignedTx found in response:", txResponse.data)
        toast.error("Transaction data is missing from server response")
        return
      }

      console.log("[Shipment] Unsigned transaction:", { length: unsignedTx.length, prefix: unsignedTx.slice(0, 30) })

      toast.info("Please sign the transaction in your wallet...")
      const signedTx = await signTx(walletId, unsignedTx)

      toast.info("Submitting to blockchain...")
      const submitResponse = await contractRepository.submitTx(signedTx)

      if (!submitResponse.result) {
        toast.error(submitResponse.message || "Failed to submit transaction")
        return
      }

      const txHash = submitResponse.data as string
      toast.info("Saving shipment record...")

      await createShipment.mutateAsync({
        batchId: formData.batchId,
        receiverAgentId: nextStep.agent.id,
        destination: nextStep.agent.location || "",
        quantity,
        createTxHash: txHash,
      })

      toast.success("Shipment created! TxHash: " + txHash.slice(0, 16) + "...")
      setFormData({ batchId: "", receiverAgentId: "", destination: "" })
      setOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create shipment"
      if (message.includes("cancelled")) {
        toast.info("Transaction cancelled")
      } else {
        toast.error(message)
      }
    } finally {
      setSigning(false)
    }
  }

  if (batchesLoading) return <LoadingState />
  if (batchesError) return <ErrorState message={batchesError.message} onRetry={refetch} />

  const mintedBatches = batches?.filter((b) => b.status !== "CREATED") || []

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <PageHeader title="Shipments" description="Ship batches to agents">
        {mintedBatches.length > 0 && (
          <ShipmentForm
            open={open}
            onOpenChange={setOpen}
            formData={formData}
            onFormChange={setFormData}
            onSubmit={handleSubmit}
            isPending={createShipment.isPending || signing}
            batches={mintedBatches}
          />
        )}
      </PageHeader>

      {!mintedBatches?.length ? (
        <EmptyState
          icon="local_shipping"
          message="No minted batches available to ship"
          actionLabel="Go to Batches"
          onAction={() => window.location.href = "/batches"}
        />
      ) : (
        <ShipmentList batches={mintedBatches} />
      )}
    </div>
  )
}
