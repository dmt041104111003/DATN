import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { agentsApi } from '@/lib/api/agents'
import { Agent, AgentFormData } from '@/types/agent'
import { handleApiError } from '@/lib/utils/error-handler'
import { showAlert } from '@/lib/utils/alert'

export function useAgents() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [location, setLocation] = useState<{ location: string; gpsCoordinates: string } | undefined>()
  const form = useForm<AgentFormData>()

  const loadData = async () => {
    try {
      const data = await agentsApi.findAll()
      setAgents(Array.isArray(data) ? data : [])
    } catch {
      setAgents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = () => {
    form.reset({
      walletAddress: '',
      displayName: '',
      location: '',
      gpsLatitude: undefined,
      gpsLongitude: undefined,
    })
    setLocation(undefined)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    form.reset()
    setLocation(undefined)
  }

  const onSubmit = async (data: AgentFormData) => {
    setSubmitting(true)
    try {
      const coords = location?.gpsCoordinates?.split(',')
      const payload = {
        ...data,
        location: location?.location,
        gpsLatitude: coords && coords.length >= 1 ? parseFloat(coords[0].trim()) : undefined,
        gpsLongitude: coords && coords.length >= 2 ? parseFloat(coords[1].trim()) : undefined,
      }
      await agentsApi.upsert(payload)
      handleClose()
      await loadData()
    } catch (err) {
      const errorMessage = handleApiError(err, router)
      showAlert({ description: errorMessage, variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return {
    items: agents,
    loading,
    open,
    submitting,
    form,
    location,
    setLocation,
    setOpen,
    handleCreate,
    handleClose,
    onSubmit,
  }
}

