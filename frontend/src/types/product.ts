import { UseFormReturn, SubmitHandler } from 'react-hook-form'

export interface Product {
  id: string
  userId: string
  policyId?: string
  assetName?: string
  name: string
  historyHash?: string
  createdAt: string
  updatedAt: string
}

export interface ProductQuota {
  tier: string
  maxProducts: number | null
  usedProducts: number
  remainingProducts: number | string
}

export interface ProductMaterial {
  id: string
  productId: string
  materialId: string
  quantity: number
  unit?: string
  createdAt: string
  updatedAt: string
}

export interface ProductFormData {
  name: string
}

export interface ProductFormProps {
  open: boolean
  submitting: boolean
  editing: boolean
  form: UseFormReturn<ProductFormData>
  setOpen: (open: boolean) => void
  handleCreate: () => void
  handleClose: () => void
  onSubmit: SubmitHandler<ProductFormData>
}

export interface ProductTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}
