import { request } from './request'
import { Certification } from '@/types/certification'

export const certificationsApi = {
  findAll: () => {
    const endpoint = '/certifications'
    return request<Certification[]>(endpoint)
  },

  findOne: (id: string) => {
    const endpoint = `/certifications/${id}`
    return request<Certification>(endpoint)
  },

  create: (data: { productId?: string; certName: string; issueDate: string; expiryDate?: string; certHash?: string }) => {
    const endpoint = '/certifications'
    const method = 'POST'
    const body = JSON.stringify(data)
    return request<Certification>(endpoint, { method, body })
  },

  update: (id: string, data: Partial<Certification>) => {
    const endpoint = `/certifications/${id}`
    const method = 'PATCH'
    const body = JSON.stringify(data)
    return request<Certification>(endpoint, { method, body })
  },

  remove: (id: string) => {
    const endpoint = `/certifications/${id}`
    const method = 'DELETE'
    return request<{ message: string }>(endpoint, { method })
  },
}
