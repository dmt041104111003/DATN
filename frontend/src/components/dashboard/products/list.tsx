"use client"

import { useProducts } from '@/hooks/useProducts'
import { LoadingPage } from '@/components/ui/loading'
import Image from 'next/image'
import { Form } from './form'
import { ProductTable } from './table'

export function List() {
  const {
    items: products,
    loading,
    error,
    open,
    submitting,
    editing,
    form,
    materials,
    certifications,
    media,
    availableMaterials,
    availableCertifications,
    availableMedia,
    hashRoots,
    setMaterials,
    setCertifications,
    setMedia,
    setHashRoots,
    setOpen,
    handleCreate,
    handleEdit,
    handleDelete,
    handleClose,
    handleMint,
    onSubmit,
  } = useProducts()

  if (loading) return <LoadingPage />

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your products</p>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <Image
            src="/404.png"
            alt="404"
            height={500}
            width={750}
            className="mx-auto opacity-80"
          />
          <p className="-mt-2 text-xl text-muted-foreground">No products found</p>
        </div>
      </div>
    )
  }

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
          product={editing}
          materials={materials}
          certifications={certifications}
          media={media}
          availableMaterials={availableMaterials}
          availableCertifications={availableCertifications}
          availableMedia={availableMedia}
          hashRoots={hashRoots}
          onMaterialsChange={setMaterials}
          onCertificationsChange={setCertifications}
          onMediaChange={setMedia}
          setHashRoots={setHashRoots}
          onMint={handleMint}
          setOpen={setOpen}
          handleCreate={handleCreate}
          handleClose={handleClose}
          onSubmit={onSubmit}
        />
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Image
            src="/404.png"
            alt="404"
            height={500}
            width={750}
            className="mx-auto opacity-80"
          />
          <p className="-mt-2 text-xl text-muted-foreground">No products found</p>
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
