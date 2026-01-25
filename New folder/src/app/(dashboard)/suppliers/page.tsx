"use client"

import { useState } from "react"
import { useSuppliers, useCreateSupplier, useDeleteSupplier } from "@/hooks/use-suppliers"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/dashboard/empty-state"
import { LoadingState } from "@/components/dashboard/loading-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { SupplierForm } from "@/components/suppliers/supplier-form"
import { SupplierList } from "@/components/suppliers/supplier-list"
import type { CreateSupplierInput } from "@/types"

export default function SuppliersPage() {
  const { data: suppliers, isLoading, error, refetch } = useSuppliers()
  const createSupplier = useCreateSupplier()
  const deleteSupplier = useDeleteSupplier()

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<CreateSupplierInput>({
    name: "",
    location: "",
    contactInfo: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createSupplier.mutateAsync(formData)
      setFormData({ name: "", location: "", contactInfo: "" })
      setOpen(false)
      toast.success("Supplier created successfully")
    } catch {
      toast.error("Failed to create supplier")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSupplier.mutateAsync(id)
      toast.success("Supplier deleted")
    } catch {
      toast.error("Failed to delete supplier")
    }
  }

  const handleAutoFill = () => {
    const sampleSuppliers = [
      { name: "ABC Food Distributors", location: "Hanoi, Vietnam", contactInfo: "info@abcfood.vn" },
      { name: "Global Produce Co.", location: "Ho Chi Minh City, Vietnam", contactInfo: "+84 912 345 678" },
      { name: "Fresh Farm Supplies", location: "Da Nang, Vietnam", contactInfo: "contact@freshfarm.vn" },
      { name: "Premium Ingredients Ltd", location: "Can Tho, Vietnam", contactInfo: "sales@premiumingredients.com" },
      { name: "Organic Source Vietnam", location: "Hue, Vietnam", contactInfo: "+84 987 654 321" },
    ]
    const randomSupplier = sampleSuppliers[Math.floor(Math.random() * sampleSuppliers.length)]
    setFormData(randomSupplier)
    toast.success("Form auto-filled with sample data")
  }

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <PageHeader title="Suppliers" description="Manage product origin sources">
        <SupplierForm
          open={open}
          onOpenChange={setOpen}
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          isPending={createSupplier.isPending}
          onAutoFill={handleAutoFill}
        />
      </PageHeader>

      {!suppliers?.length ? (
        <EmptyState
          icon="factory"
          message="No suppliers yet"
          actionLabel="Add supplier"
          onAction={() => setOpen(true)}
        />
      ) : (
        <SupplierList suppliers={suppliers} onDelete={handleDelete} />
      )}
    </div>
  )
}
