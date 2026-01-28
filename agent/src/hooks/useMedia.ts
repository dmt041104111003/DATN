import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { mediaApi } from '@/lib/api/media'
import { Media } from '@/types/media'
import { useAuth } from '@/contexts/auth-context'
import { handleApiError } from '@/lib/utils/error-handler'
import { showAlert } from '@/lib/utils/alert'
import { confirm } from '@/lib/utils/confirm'

export function useMedia() {
  const router = useRouter()
  const { user } = useAuth()
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const batchFileInputRef = useRef<HTMLInputElement>(null)

  const loadData = async () => {
    try {
      const data = await mediaApi.findAll()
      setMedia(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadData()
  }, [user, router])

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    setUploading(true)
    try {
      if (files.length === 1) {
        await mediaApi.upload(files[0])
        showAlert({ description: 'Upload successful!', variant: 'success' })
      } else {
        const result = await mediaApi.uploadBatch(Array.from(files))
        if (result.failed > 0) {
          showAlert({ description: `Upload completed: ${result.successful.length}/${result.total} files successful. ${result.failed} files failed.`, variant: 'warning' })
        } else {
          showAlert({ description: `Upload successful ${result.total} files!`, variant: 'success' })
        }
      }
      setUploadOpen(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (batchFileInputRef.current) batchFileInputRef.current.value = ''
      await loadData()
    } catch (err) {
      const errorMessage = handleApiError(err, router)
      if (errorMessage.includes('IPFS')) {
        showAlert({ description: `${errorMessage}. Please try again later or contact technical support.`, variant: 'error' })
      } else {
        showAlert({ description: errorMessage, variant: 'error' })
      }
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!(await confirm('Delete this media?'))) return
    try {
      await mediaApi.remove(id)
      await loadData()
    } catch (err) {
      const errorMessage = handleApiError(err, router)
      showAlert({ description: errorMessage, variant: 'error' })
    }
  }

  return {
    items: media,
    loading,
    uploadOpen,
    uploading,
    fileInputRef,
    batchFileInputRef,
    setUploadOpen,
    handleUpload,
    handleDelete,
  }
}
