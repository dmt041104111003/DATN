"use client"

import { useMaterials } from '@/hooks/useMaterials'
import { LoadingPage } from '@/components/ui/loading'
import Image from 'next/image'
import { Form } from './form'
import { MaterialTable } from './table'

export function List() {
  const {
    items: materials,
    suppliers,
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
  } = useMaterials()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Materials</h1>
          <p className="text-muted-foreground">Manage raw materials</p>
        </div>
        <Form
          open={open}
          submitting={submitting}
          editing={!!editing}
          form={form}
          suppliers={suppliers}
          setOpen={setOpen}
          handleCreate={handleCreate}
          handleClose={handleClose}
          onSubmit={onSubmit}
        />
      </div>
      {loading ? (
        <LoadingPage />
      ) : materials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Image
            src="/404.png"
            alt="404"
            height={500}
            width={750}
            className="mx-auto opacity-80"
          />
          <p className="-mt-2 text-xl text-muted-foreground">No materials found</p>
        </div>
      ) : (
        <MaterialTable
          materials={materials}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
