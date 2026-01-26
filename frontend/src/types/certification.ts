import { UseFormReturn, SubmitHandler } from 'react-hook-form'
import { Product } from './product'

export interface Certification {
  id: string
  productId: string
  certName: string
  issueDate: string
  expiryDate?: string
  certHash?: string
  createdAt: string
  updatedAt: string
}

export interface CertificationFormData {
  productId: string
  certName: string
  issueDate: string
  expiryDate?: string
  certHash?: string
}

export interface CertificationFormProps {
  open: boolean
  submitting: boolean
  editing: boolean
  form: UseFormReturn<CertificationFormData>
  products: Product[]
  setOpen: (open: boolean) => void
  handleCreate: () => void
  handleClose: () => void
  onSubmit: SubmitHandler<CertificationFormData>
}

export interface CertificationTableProps {
  certifications: Certification[]
  products: Product[]
  onEdit: (certification: Certification) => void
  onDelete: (id: string) => void
}
