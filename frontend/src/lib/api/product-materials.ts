import { request } from './request'
import { ProductMaterial } from '@/types/product'

export const productMaterialsApi = {
  findByProduct: (productId: string) => {
    const endpoint = `/product-materials?productId=${productId}`
    return request<ProductMaterial[]>(endpoint)
  },

  findOne: (id: string) => {
    const endpoint = `/product-materials/${id}`
    return request<ProductMaterial>(endpoint)
  },

  create: (data: { productId: string; materialId: string; quantity: number; unit?: string }) => {
    const endpoint = '/product-materials'
    const method = 'POST'
    const body = JSON.stringify(data)
    return request<ProductMaterial>(endpoint, { method, body })
  },

  update: (id: string, data: Partial<ProductMaterial>) => {
    const endpoint = `/product-materials/${id}`
    const method = 'PATCH'
    const body = JSON.stringify(data)
    return request<ProductMaterial>(endpoint, { method, body })
  },

  remove: (id: string) => {
    const endpoint = `/product-materials/${id}`
    const method = 'DELETE'
    return request<{ message: string }>(endpoint, { method })
  },
}
