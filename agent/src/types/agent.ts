import { UseFormReturn, SubmitHandler } from 'react-hook-form'

export interface Agent {
  id: string
  address: string
  walletName?: string | null
  displayName?: string | null
  location?: string | null
  gpsLatitude?: number | null
  gpsLongitude?: number | null
}

export interface AgentFormData {
  walletAddress: string
  displayName?: string
  location?: string
  gpsLatitude?: number
  gpsLongitude?: number
}

export interface AgentFormProps {
  open: boolean
  submitting: boolean
  form: UseFormReturn<AgentFormData>
  location: { location: string; gpsCoordinates: string } | undefined
  setLocation: (value: { location: string; gpsCoordinates: string } | undefined) => void
  setOpen: (open: boolean) => void
  handleCreate: () => void
  handleClose: () => void
  onSubmit: SubmitHandler<AgentFormData>
}

export interface AgentTableProps {
  agents: Agent[]
}

