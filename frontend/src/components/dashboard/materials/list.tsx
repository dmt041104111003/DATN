"use client"

import { useMaterials } from '@/hooks/useMaterials'
import { LoadingPage } from '@/components/ui/loading'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Materials</h1>
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
        <div className="text-center py-8">
          <p className="text-muted-foreground">No materials yet</p>
          <button onClick={handleCreate} className="mt-4 text-primary">Add first</button>
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
