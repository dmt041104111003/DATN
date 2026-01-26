import { request } from './request'
import { Material } from '@/types/material'

export const materialsApi = {
  findAll: () => {
    const endpoint = '/materials'
    return request<Material[]>(endpoint)
  },

  findBySupplier: (supplierId: string) => {
    const endpoint = `/materials/by-supplier/${supplierId}`
    return request<Material[]>(endpoint)
  },

  findOne: (id: string) => {
    const endpoint = `/materials/${id}`
    return request<Material>(endpoint)
  },

  create: (data: { supplierId: string; name: string; harvestDate?: string; quantity?: number }) => {
    const endpoint = '/materials'
    const method = 'POST'
    const body = JSON.stringify(data)
    return request<Material>(endpoint, { method, body })
  },

  update: (id: string, data: Partial<Material>) => {
    const endpoint = `/materials/${id}`
    const method = 'PATCH'
    const body = JSON.stringify(data)
    return request<Material>(endpoint, { method, body })
  },

  remove: (id: string) => {
    const endpoint = `/materials/${id}`
    const method = 'DELETE'
    return request<{ message: string }>(endpoint, { method })
  },
}
