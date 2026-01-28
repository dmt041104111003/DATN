import { request } from './request'
import { Supplier } from '@/types/supplier'

export const supplierApi = {
  findAll: () => {
    const endpoint = '/suppliers'
    return request<Supplier[]>(endpoint)
  },

  findOne: (id: string) => {
    const endpoint = `/suppliers/${id}`
    return request<Supplier>(endpoint)
  },

  create: (data: { name: string; location?: string; gpsCoordinates?: string; contactInfo?: string }) => {
    const endpoint = '/suppliers'
    const method = 'POST'
    const body = JSON.stringify(data)
    return request<Supplier>(endpoint, { method, body })
  },

  update: (id: string, data: Partial<Supplier>) => {
    const endpoint = `/suppliers/${id}`
    const method = 'PATCH'
    const body = JSON.stringify(data)
    return request<Supplier>(endpoint, { method, body })
  },

  remove: (id: string) => {
    const endpoint = `/suppliers/${id}`
    const method = 'DELETE'
    return request<{ message: string }>(endpoint, { method })
  },
}
