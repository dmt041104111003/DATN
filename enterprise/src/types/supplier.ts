import { UseFormReturn, SubmitHandler } from 'react-hook-form'

export interface Supplier {
  id: string
  userId: string
  name: string
  location?: string
  gpsCoordinates?: string
  contactInfo?: string
  createdAt: string
  updatedAt: string
}

export interface SupplierFormData {
  name: string
  contactInfo?: string
  location?: string
  gpsCoordinates?: string
}

export interface SupplierFormProps {
  open: boolean
  submitting: boolean
  editing: boolean
  form: UseFormReturn<SupplierFormData>
  location: { location: string; gpsCoordinates: string } | undefined
  setLocation: (value: { location: string; gpsCoordinates: string } | undefined) => void
  setOpen: (open: boolean) => void
  handleCreate: () => void
  handleClose: () => void
  onSubmit: SubmitHandler<SupplierFormData>
}

export interface SupplierTableProps {
  suppliers: Supplier[]
  onEdit: (supplier: Supplier) => void
  onDelete: (id: string) => void
}
