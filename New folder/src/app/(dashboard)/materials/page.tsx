"use client"

import { useState } from "react"
import { useMaterials, useCreateMaterial, useDeleteMaterial } from "@/hooks/use-materials"
import { useSuppliers } from "@/hooks/use-suppliers"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/dashboard/empty-state"
import { LoadingState } from "@/components/dashboard/loading-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { MaterialForm } from "@/components/materials/material-form"
import { MaterialList } from "@/components/materials/material-list"
import type { CreateMaterialInput } from "@/types"

export default function MaterialsPage() {
  const { data: materials, isLoading, error, refetch } = useMaterials()
  const { data: suppliers } = useSuppliers()
  const createMaterial = useCreateMaterial()
  const deleteMaterial = useDeleteMaterial()

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<CreateMaterialInput>({
    name: "",
    supplierId: "",
    quantity: 0,
    harvestDate: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMaterial.mutateAsync(formData)
      setFormData({ name: "", supplierId: "", quantity: 0, harvestDate: "" })
      setOpen(false)
      toast.success("Material created successfully")
    } catch {
      toast.error("Failed to create material")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMaterial.mutateAsync(id)
      toast.success("Material deleted")
    } catch {
      toast.error("Failed to delete material")
    }
  }

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <PageHeader title="Materials" description="Track raw material origins">
        <MaterialForm
          open={open}
          onOpenChange={setOpen}
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          isPending={createMaterial.isPending}
          suppliers={suppliers}
        />
      </PageHeader>

      {!materials?.length ? (
        <EmptyState
          icon="eco"
          message="No materials yet"
          actionLabel="Add material"
          onAction={() => setOpen(true)}
        />
      ) : (
        <MaterialList materials={materials} suppliers={suppliers} onDelete={handleDelete} />
      )}
    </div>
  )
}
