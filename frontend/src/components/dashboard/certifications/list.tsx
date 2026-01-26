"use client"

import { useCertifications } from '@/hooks/useCertifications'
import { LoadingPage } from '@/components/ui/loading'
import Image from 'next/image'
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certifications</h1>
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
        <div className="flex flex-col items-center justify-center py-8">
          <Image
            src="/404.png"
            alt="404"
            height={500}
            width={750}
            className="mx-auto opacity-80"
          />
          <p className="-mt-2 text-xl text-muted-foreground">No certifications found</p>
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
