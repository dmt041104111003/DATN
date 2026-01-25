"use client"

import { useState, useEffect } from "react"
import { useAgents, useCreateAgent, useDeleteAgent, useUpdateAgent } from "@/hooks/use-agents"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/dashboard/empty-state"
import { LoadingState } from "@/components/dashboard/loading-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { AgentForm } from "@/components/agents/agent-form"
import { AgentList } from "@/components/agents/agent-list"
import { contractRepository } from "@/lib/api/contract.repository"
import { useWalletConnect } from "@/hooks/use-wallet"
import { useAuthStore } from "@/stores/auth.store"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import type { CreateAgentInput } from "@/types"

export default function AgentsPage() {
  const { data: agents, isLoading, error, refetch } = useAgents()
  const createAgent = useCreateAgent()
  const deleteAgent = useDeleteAgent()
  const updateAgent = useUpdateAgent()
  const { signTx } = useWalletConnect()
  const { user, walletId, setUser } = useAuthStore()

  const [open, setOpen] = useState(false)
  const [signing, setSigning] = useState(false)
  const [initializingRegistry, setInitializingRegistry] = useState(false)
  const [hasRegistry, setHasRegistry] = useState<boolean | null>(null)
  const [formData, setFormData] = useState<CreateAgentInput>({
    name: "",
    address: "",
    location: "",
    contactInfo: "",
    gpsCoordinates: "",
  })

  useEffect(() => {
    setHasRegistry(!!user?.registryTxHash)
  }, [user?.registryTxHash])

  const handleInitializeRegistry = async () => {
    if (!user?.address || !walletId) {
      toast.error("Please connect your wallet first")
      return
    }

    setInitializingRegistry(true)

    try {
      const txResponse = await contractRepository.initializeRegistry(user.address)
      if (!txResponse.result || !txResponse.data) {
        toast.error(txResponse.message)
        return
      }

      const signedTx = await signTx(walletId, txResponse.data as string)
      const submitResponse = await contractRepository.submitTx(signedTx)

      if (!submitResponse.result) {
        toast.error(submitResponse.message)
        return
      }

      const txHash = submitResponse.data as string
      const { userRepository } = await import("@/lib/api/user.repository")
      const updatedUser = await userRepository.updateMe({ registryTxHash: txHash })
      setUser(updatedUser, walletId || undefined)
      setHasRegistry(true)
      toast.success("Registry initialized!")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed"
      if (!message.includes("cancelled")) toast.error(message)
    } finally {
      setInitializingRegistry(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.address || !walletId) {
      toast.error("Please connect your wallet first")
      return
    }

    setSigning(true)

    try {
      toast.info("Creating blockchain transaction...")
      
      const txResponse = await contractRepository.addAgentToRegistry(
        user.address,
        formData.address
      )

      if (!txResponse.result || !txResponse.data) {
        if (txResponse.message.includes("REGISTRY") && txResponse.message.includes("not found")) {
          toast.error("You need to initialize your Business Registry first. Go to Settings to set up.")
        } else {
          toast.error("Failed to create transaction: " + txResponse.message)
        }
        return
      }

      toast.info("Please sign the transaction in your wallet...")
      const signedTx = await signTx(walletId, txResponse.data.unsignedTx)

      toast.info("Submitting to blockchain...")
      const submitResponse = await contractRepository.submitTx(signedTx)

      if (!submitResponse.result) {
        toast.error("Blockchain submission failed: " + submitResponse.message)
        return
      }

      const txHash = submitResponse.data as string
      toast.success("Blockchain confirmed! Saving to database...")

      await createAgent.mutateAsync({
        ...formData,
        addAgentTxHash: txHash,
      })

      setFormData({ name: "", address: "", location: "", contactInfo: "", gpsCoordinates: "" })
      setOpen(false)
      toast.success("Agent added successfully! TxHash: " + txHash.slice(0, 16) + "...")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create agent"
      if (message.includes("cancelled")) {
        toast.info("Transaction cancelled")
      } else {
        toast.error(message)
      }
    } finally {
      setSigning(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAgent.mutateAsync(id)
      toast.success("Agent deleted")
    } catch {
      toast.error("Failed to delete agent")
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateAgent.mutateAsync({ id, data: { isActive: !isActive } })
      toast.success(`Agent ${!isActive ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error("Failed to update agent status")
    }
  }

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <PageHeader title="Agents" description="Manage distribution agents">
        {hasRegistry ? (
          <AgentForm
            open={open}
            onOpenChange={setOpen}
            formData={formData}
            onFormChange={setFormData}
            onSubmit={handleSubmit}
            isPending={createAgent.isPending || signing}
          />
        ) : (
          <Button onClick={handleInitializeRegistry} disabled={initializingRegistry}>
            {initializingRegistry ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Initializing...
              </>
            ) : (
              <>
                <Icon name="add" size="sm" className="mr-2" />
                Initialize Registry
              </>
            )}
          </Button>
        )}
      </PageHeader>

      {!agents?.length ? (
        <EmptyState
          icon="storefront"
          message={hasRegistry ? "No agents yet" : "Initialize Registry to add agents"}
          actionLabel={hasRegistry ? "Add agent" : "Initialize Registry"}
          onAction={() => hasRegistry ? setOpen(true) : handleInitializeRegistry()}
        />
      ) : (
        <AgentList 
          agents={agents} 
          onDelete={handleDelete} 
          onToggleActive={handleToggleActive}
        />
      )}
    </div>
  )
}
