"use client"

import { useState } from "react"
import { useMyProducts, useCreateProduct, useDeleteProduct, useUpdateProduct } from "@/hooks/use-products"
import { useMaterials } from "@/hooks/use-materials"
import { useCertifications } from "@/hooks/use-certifications"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/dashboard/empty-state"
import { LoadingState } from "@/components/dashboard/loading-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { ProductForm } from "@/components/products/product-form"
import { ProductList } from "@/components/products/product-list"
import type { CreateProductInput, UpdateProductInput } from "@/types"

export default function ProductsPage() {
  const { data: products, isLoading, error, refetch } = useMyProducts()
  const { data: materials, isLoading: loadingMaterials } = useMaterials()
  const { data: certifications, isLoading: loadingCertifications } = useCertifications()
  const createProduct = useCreateProduct()
  const deleteProduct = useDeleteProduct()
  const updateProduct = useUpdateProduct()

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<CreateProductInput>({
    name: "",
    description: "",
    imageUrl: "",
    materialIds: [],
    certificationIds: [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createProduct.mutateAsync(formData)
      setFormData({ name: "", description: "", imageUrl: "", materialIds: [], certificationIds: [] })
      setOpen(false)
      toast.success("Product created successfully")
    } catch {
      toast.error("Failed to create product")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id)
      toast.success("Product deleted")
    } catch {
      toast.error("Failed to delete product")
    }
  }

  const handleUpdate = async (id: string, data: UpdateProductInput) => {
    try {
      await updateProduct.mutateAsync({ id, data })
      toast.success("Product updated successfully")
    } catch {
      toast.error("Failed to update product")
    }
  }

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <PageHeader title="Products" description="Manage products for origin traceability">
        <ProductForm
          open={open}
          onOpenChange={setOpen}
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          isPending={createProduct.isPending}
          materials={materials}
          loadingMaterials={loadingMaterials}
          certifications={certifications}
          loadingCertifications={loadingCertifications}
        />
      </PageHeader>

      {!products?.length ? (
        <EmptyState
          icon="sell"
          message="No products yet"
          actionLabel="Add your first product"
          onAction={() => setOpen(true)}
        />
      ) : (
        <ProductList 
          products={products} 
          materials={materials || []}
          certifications={certifications || []}
          onDelete={handleDelete} 
          onUpdate={handleUpdate}
          isUpdating={updateProduct.isPending}
        />
      )}
    </div>
  )
}
