const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export interface UploadedMedia {
  id: string
  name: string
  type: string
  url: string
  gatewayUrl: string
  cid: string
}

export const mediaRepository = {
  upload: async (file: File): Promise<UploadedMedia> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${BASE_URL}/media/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  },

  uploadBatch: async (files: File[]): Promise<UploadedMedia[]> => {
    const formData = new FormData()
    files.forEach((file) => formData.append("files", file))

    const response = await fetch(`${BASE_URL}/media/upload/batch`, {
      method: "POST",
      credentials: "include",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  },
}
