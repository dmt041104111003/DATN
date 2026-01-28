import { UseFormReturn, SubmitHandler } from 'react-hook-form'
import { Material } from './material'

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
  certId?: string // ID of existing certification to link
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
  media: ProductMediaItem[]
  availableMaterials: Material[]
  availableMedia: ProductMediaItem[]
  hashRoots?: {
    materialsRoot: string
    certificationsRoot: string
    mediaRoot: string
  }
  onMaterialsChange: (materials: ProductMaterialItem[]) => void
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
