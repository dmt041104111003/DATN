import { UseFormReturn, SubmitHandler } from 'react-hook-form'
import { Material } from './material'
import { Certification } from './certification'

export interface Product {
  id: string
  userId: string
  policyId: string
  assetName: string
  name: string
  materialsRoot: string
  certificationsRoot: string
  mediaRoot: string
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
  pmHash: string
  createdAt: string
  updatedAt: string
}

export interface ProductFormData {
  name: string
  totalQuantity?: number
  unit?: string
}

export interface ProductMaterialItem {
  materialId: string
  material?: {
    id: string
    name: string
    supplier?: {
      name: string
    }
  }
}

export interface ProductCertificationItem {
  certName: string
  issueDate: string
  expiryDate?: string
}

export interface ProductMediaItem {
  id: string
  name: string
  type: string
  url: string
  gatewayUrl?: string
}

export interface ProductFormProps {
  open: boolean
  submitting: boolean
  editing: boolean
  form: UseFormReturn<ProductFormData>
  product?: Product | null
  materials: ProductMaterialItem[]
  certifications: ProductCertificationItem[]
  media: ProductMediaItem[]
  availableMaterials: Material[]
  availableCertifications: Certification[]
  availableMedia: ProductMediaItem[]
  hashRoots?: {
    materialsRoot: string
    certificationsRoot: string
    mediaRoot: string
  }
  onMaterialsChange: (materials: ProductMaterialItem[]) => void
  onCertificationsChange: (certifications: ProductCertificationItem[]) => void
  onMediaChange: (media: ProductMediaItem[]) => void
  setHashRoots?: (roots: { materialsRoot: string; certificationsRoot: string; mediaRoot: string }) => void
  onMint?: () => void
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
