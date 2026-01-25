"use client"

import { useState } from "react"
import { useBatches, useCreateBatch, useDeleteBatch, useUpdateBatch } from "@/hooks/use-batches"
import { useMyProducts } from "@/hooks/use-products"
import { useAgents } from "@/hooks/use-agents"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/dashboard/empty-state"
import { LoadingState } from "@/components/dashboard/loading-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { BatchForm } from "@/components/batches/batch-form"
import { BatchEditDialog } from "@/components/batches/batch-edit-dialog"
import { BatchList } from "@/components/batches/batch-list"
import { contractRepository } from "@/lib/api/contract.repository"
import { useWalletConnect } from "@/hooks/use-wallet"
import { useAuthStore } from "@/stores/auth.store"
import type { CreateBatchInput, Batch, UpdateBatchInput } from "@/types"

export default function BatchesPage() {
  const { data: batches, isLoading, error, refetch } = useBatches()
  const { data: products, isLoading: loadingProducts } = useMyProducts()
  const { data: agents, isLoading: loadingAgents } = useAgents()
  const createBatch = useCreateBatch()
  const deleteBatch = useDeleteBatch()
  const updateBatch = useUpdateBatch()
  const { signTx } = useWalletConnect()
  const { user, walletId } = useAuthStore()

  const [open, setOpen] = useState(false)
  const [signing, setSigning] = useState(false)
  const [formData, setFormData] = useState<CreateBatchInput>({
    name: "",
    description: "",
    imageUrl: "",
    initialQuantity: 0,
    unit: "",
    productId: "",
    roadmapAgentIds: [],
  })

  const [editBatch, setEditBatch] = useState<Batch | null>(null)
  const [editData, setEditData] = useState<UpdateBatchInput>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.productId) {
      toast.error("Please select a product")
      return
    }

    if (!formData.roadmapAgentIds || formData.roadmapAgentIds.length === 0) {
      toast.error("Please select at least one agent for the roadmap")
      return
    }
    
    if (!user?.address || !walletId) {
      toast.error("Please connect your wallet first")
      return
    }

    const roadmapAgentAddresses = formData.roadmapAgentIds
      .map(id => agents?.find(a => a.id === id)?.address)
      .filter((addr): addr is string => !!addr)

    if (roadmapAgentAddresses.length !== formData.roadmapAgentIds.length) {
      toast.error("Invalid agent selection")
      return
    }

    setSigning(true)

    try {
      toast.info("Getting current GPS location...")
      let originGps = ""
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
            enableHighAccuracy: true,
            timeout: 10000,
          })
        })
        originGps = `${position.coords.latitude},${position.coords.longitude}`
        toast.success(`GPS captured: ${originGps}`)
      } catch (gpsErr) {
        console.warn("GPS not available:", gpsErr)
        toast.warning("GPS not available, batch will be created without origin location")
      }

      toast.info("Creating mint transaction...")
      
      // Generate short asset name: 7 alphanumeric characters only (no prefix)
      // This keeps the hex-encoded name short for wallet display
      const randomChars = Math.random().toString(36).substring(2, 9)
      const assetName = randomChars // Just 7 chars, no "LAB_" prefix to keep it short
      const uniqueId = Date.now().toString(36).slice(-8) + Math.random().toString(36).substring(2, 6)
      const batchId = `batch_${uniqueId}`
      
      const txResponse = await contractRepository.createBatchMint(
        user.address,
        {
          assetName,
          quantity: String(formData.initialQuantity),
          roadmapAgentAddresses,
          originGps,
          unit: formData.unit,
          productId: formData.productId,
          batchInfo: {
            id: batchId,
            name: `${formData.name} - ${uniqueId}`,
            description: formData.description,
            imageUrl: formData.imageUrl,
            productionDate: formData.productionDate,
            expiryDate: formData.expiryDate,
          },
        }
      )

      if (!txResponse.result || !txResponse.data) {
        console.error("[Batch] Create tx failed:", txResponse)
        toast.error(txResponse.message || "Failed to create transaction")
        return
      }

      toast.info("Please sign the transaction in your wallet...")
      const signedTx = await signTx(walletId, txResponse.data.unsignedTx)

      toast.info("Submitting to blockchain...")
      const submitResponse = await contractRepository.submitTx(signedTx)

      if (!submitResponse.result) {
        console.error("[Batch] Submit failed:", submitResponse)
        toast.error(submitResponse.message || "Failed to submit transaction")
        return
      }

      const txHash = submitResponse.data as string
      toast.success("Blockchain confirmed! Saving batch...")

      const mintData = txResponse.data as { unsignedTx: string; policyId: string; assetName?: string }
      const normalizedAssetName = mintData.assetName || assetName

      await createBatch.mutateAsync({
        ...formData,
        policyId: txResponse.data.policyId,
        assetName: normalizedAssetName,
        mintTxHash: txHash,
        originGps,
      })

      setFormData({ name: "", description: "", imageUrl: "", initialQuantity: 0, unit: "", productId: "", roadmapAgentIds: [] })
      setOpen(false)
      toast.success("Batch created and minted! TxHash: " + txHash.slice(0, 16) + "...")
    } catch (err) {
      console.error("[Batch] Error:", err)
      const message = err instanceof Error ? err.message : "Failed to create batch"
      if (message.includes("cancelled")) {
        toast.info("Transaction cancelled")
      } else {
        toast.error(message)
      }
    } finally {
      setSigning(false)
    }
  }


  const handleBurn = async (batch: Batch) => {
    if (!user?.address || !walletId) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!batch.policyId || !batch.assetName) {
      toast.error("Batch has no NFT to burn")
      return
    }

    setSigning(true)

    try {
      toast.info("Creating burn transaction...")
      
      const txResponse = await contractRepository.createBurn(user.address, [
        {
          assetName: batch.assetName,
          quantity: String(batch.currentQuantity),
        },
      ])

      if (!txResponse.result || !txResponse.data) {
        toast.error(txResponse.message || "Failed to create burn transaction")
        return
      }

      toast.info("Please sign the transaction in your wallet...")
      const signedTx = await signTx(walletId, txResponse.data as string)

      toast.info("Submitting to blockchain...")
      const submitResponse = await contractRepository.submitTx(signedTx)

      if (!submitResponse.result) {
        toast.error(submitResponse.message || "Failed to submit transaction")
        return
      }

      const txHash = submitResponse.data as string
      await deleteBatch.mutateAsync(batch.id)
      toast.success("Batch burned! TxHash: " + txHash.slice(0, 16) + "...")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to burn batch"
      if (message.includes("cancelled")) {
        toast.info("Transaction cancelled")
      } else {
        toast.error(message)
      }
    } finally {
      setSigning(false)
    }
  }

  const handleOpenEdit = (batch: Batch) => {
    setEditBatch(batch)
    setEditData({
      name: batch.name,
      description: batch.description || "",
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editBatch) return

    if (!user?.address || !walletId) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!editBatch.assetName) {
      toast.error("Batch has no NFT to update")
      return
    }

    setSigning(true)

    try {
      toast.info("Creating update transaction...")

      const txResponse = await contractRepository.createUpdate(user.address, [
        {
          assetName: editBatch.assetName,
          metadata: {
            name: editData.name || editBatch.name,
            description: editData.description || "",
            batchId: editBatch.id,
            productionDate: editBatch.productionDate || "",
            expiryDate: editBatch.expiryDate || "",
          },
        },
      ])

      if (!txResponse.result || !txResponse.data) {
        toast.error(txResponse.message || "Failed to create update transaction")
        return
      }

      toast.info("Please sign the transaction in your wallet...")
      const signedTx = await signTx(walletId, txResponse.data as string)

      toast.info("Submitting to blockchain...")
      const submitResponse = await contractRepository.submitTx(signedTx)

      if (!submitResponse.result) {
        toast.error(submitResponse.message || "Failed to submit transaction")
        return
      }

      const txHash = submitResponse.data as string

      await updateBatch.mutateAsync({
        id: editBatch.id,
        data: editData,
      })

      setEditBatch(null)
      toast.success("Batch updated! TxHash: " + txHash.slice(0, 16) + "...")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update batch"
      if (message.includes("cancelled")) {
        toast.info("Transaction cancelled")
      } else {
        toast.error(message)
      }
    } finally {
      setSigning(false)
    }
  }

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <PageHeader title="Batches" description="Manage product batches">
        <BatchForm
          open={open}
          onOpenChange={setOpen}
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          isPending={createBatch.isPending || signing}
          products={products || []}
          agents={(agents || []).filter(a => a.isActive)}
          loadingProducts={loadingProducts}
          loadingAgents={loadingAgents}
        />
      </PageHeader>

      {!batches?.length ? (
        <EmptyState
          icon="inventory_2"
          message="No batches yet"
          actionLabel="Create batch"
          onAction={() => setOpen(true)}
        />
      ) : (
        <BatchList 
          batches={batches} 
          onBurn={handleBurn}
          onUpdate={handleOpenEdit}
        />
      )}

      <BatchEditDialog
        batch={editBatch}
        open={!!editBatch}
        onOpenChange={(open) => !open && setEditBatch(null)}
        formData={editData}
        onFormChange={setEditData}
        onSubmit={handleUpdate}
        isPending={updateBatch.isPending || signing}
      />
    </div>
  )
}
