"use client"

import { useCertifications } from '@/hooks/useCertifications'
import { LoadingPage } from '@/components/ui/loading'
import { Form } from './form'
import { CertificationTable } from './table'

export function List() {
  const {
    items: certifications,
    products,
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
  } = useCertifications()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Certifications</h1>
          <p className="text-muted-foreground">Manage product certifications</p>
        </div>
        <Form
          open={open}
          submitting={submitting}
          editing={!!editing}
          form={form}
          products={products}
          setOpen={setOpen}
          handleCreate={handleCreate}
          handleClose={handleClose}
          onSubmit={onSubmit}
        />
      </div>
      {loading ? (
        <LoadingPage />
      ) : certifications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No certifications yet</p>
          <button onClick={handleCreate} className="mt-4 text-primary">Add first</button>
        </div>
      ) : (
        <CertificationTable
          certifications={certifications}
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
