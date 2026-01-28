import { request } from './request'
import { Product, ProductQuota } from '@/types/product'

export const productsApi = {
  findAll: () => {
    const endpoint = '/products'
    return request<Product[]>(endpoint)
  },

  findMy: () => {
    const endpoint = '/products/my'
    return request<Product[]>(endpoint)
  },

  findOne: (id: string) => {
    const endpoint = `/products/${id}`
    return request<Product>(endpoint)
  },

  getQuota: () => {
    const endpoint = '/products/quota'
    return request<ProductQuota>(endpoint)
  },

  getHistory: (id: string) => {
    const endpoint = `/products/${id}/history`
    return request<{ history: unknown[] }>(endpoint)
  },

  create: (data: { name: string }) => {
    const endpoint = '/products'
    const method = 'POST'
    const body = JSON.stringify(data)
    return request<Product>(endpoint, { method, body })
  },

  update: (id: string, data: Partial<Product>) => {
    const endpoint = `/products/${id}`
    const method = 'PATCH'
    const body = JSON.stringify(data)
    return request<Product>(endpoint, { method, body })
  },

  remove: (id: string) => {
    const endpoint = `/products/${id}`
    const method = 'DELETE'
    return request<{ success: boolean; message: string; wasMinted?: boolean; warning?: string | null }>(endpoint, { method })
  },
}
