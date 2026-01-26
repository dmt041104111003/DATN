"use client"

import { useProducts } from '@/hooks/useProducts'
import { LoadingPage } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { Form } from './form'
import { ProductTable } from './table'

export function List() {
  const {
    items: products,
    loading,
    open,
    submitting,
    editing,
    form,
    setOpen,
    handleCreate,
    handleEdit,
    handleDelete,
    handleClose,
    onSubmit,
  } = useProducts()

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your products</p>
        </div>
        <Form
          open={open}
          submitting={submitting}
          editing={!!editing}
          form={form}
          setOpen={setOpen}
          handleCreate={handleCreate}
          handleClose={handleClose}
          onSubmit={onSubmit}
        />
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium text-muted-foreground mb-4">No products yet</p>
          <Button onClick={handleCreate}>Add first</Button>
        </div>
      ) : (
        <ProductTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
