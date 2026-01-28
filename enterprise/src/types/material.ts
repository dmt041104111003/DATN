import { UseFormReturn, SubmitHandler } from 'react-hook-form'
import { Supplier } from './supplier'

export interface Material {
  id: string
  userId: string
  supplierId: string
  name: string
  harvestDate?: string
  materialHash: string
  createdAt: string
  updatedAt: string
  supplier?: Supplier
}

export interface MaterialFormData {
  supplierId: string
  name: string
  harvestDate?: string
}

export interface MaterialFormProps {
  open: boolean
  submitting: boolean
  editing: boolean
  form: UseFormReturn<MaterialFormData>
  suppliers: Supplier[]
  setOpen: (open: boolean) => void
  handleCreate: () => void
  handleClose: () => void
  onSubmit: SubmitHandler<MaterialFormData>
}

export interface MaterialTableProps {
  materials: Material[]
  onEdit: (material: Material) => void
  onDelete: (id: string) => void
}
