import { request } from './request'
import { Service } from '@/types/subscription'

export const servicesApi = {
  findAll: () => {
    const endpoint = '/services'
    return request<Service[]>(endpoint)
  },

  findOne: (id: string) => {
    const endpoint = `/services/${id}`
    return request<Service>(endpoint)
  },
}
