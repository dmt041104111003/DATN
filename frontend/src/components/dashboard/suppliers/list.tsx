"use client"

import { useSupplier } from '@/hooks/useSupplier'
import { LoadingPage } from '@/components/ui/loading'
import { Form } from './form'
import { SupplierTable } from './table'

export function List() {
  const {
    items: suppliers,
    loading,
    open,
    submitting,
    editing,
    form,
    location,
    setLocation,
    setOpen,
    handleCreate,
    handleEdit,
    handleDelete,
    handleClose,
    onSubmit,
  } = useSupplier()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground">Manage your suppliers</p>
        </div>
        <Form
          open={open}
          submitting={submitting}
          editing={!!editing}
          form={form}
          location={location}
          setLocation={setLocation}
          setOpen={setOpen}
          handleCreate={handleCreate}
          handleClose={handleClose}
          onSubmit={onSubmit}
        />
      </div>
      {loading ? (
        <LoadingPage />
      ) : suppliers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No suppliers yet</p>
          <button onClick={handleCreate} className="mt-4 text-primary">Add first supplier</button>
        </div>
      ) : (
        <SupplierTable
          suppliers={suppliers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
