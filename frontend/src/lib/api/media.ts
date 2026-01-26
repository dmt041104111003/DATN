import { request } from './request'
import { Media } from '@/types/media'

export const mediaApi = {
  findAll: () => {
    const endpoint = '/media'
    return request<Media[]>(endpoint)
  },

  findOne: (id: string) => {
    const endpoint = `/media/${id}`
    return request<Media>(endpoint)
  },

  upload: (file: File) => {
    const endpoint = '/media/upload'
    const method = 'POST'
    const formData = new FormData()
    formData.append('file', file)
    return request<Media>(endpoint, { method, body: formData, headers: {} })
  },

  uploadBatch: (files: File[]) => {
    const endpoint = '/media/upload/batch'
    const method = 'POST'
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return request<{ successful: Media[]; failed: number; total: number }>(endpoint, { method, body: formData, headers: {} })
  },

  update: (id: string, data: Partial<Media>) => {
    const endpoint = `/media/${id}`
    const method = 'PATCH'
    const body = JSON.stringify(data)
    return request<Media>(endpoint, { method, body })
  },

  remove: (id: string) => {
    const endpoint = `/media/${id}`
    const method = 'DELETE'
    return request<{ message: string }>(endpoint, { method })
  },
}
