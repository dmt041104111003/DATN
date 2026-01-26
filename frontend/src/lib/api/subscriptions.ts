import { request } from './request'
import { Subscription } from '@/types/subscription'

export const subscriptionsApi = {
  findAll: () => {
    const endpoint = '/subscriptions'
    return request<Subscription[]>(endpoint)
  },

  pay: (data: { servicePlanId: string; txHash: string }) => {
    const endpoint = '/subscriptions/pay'
    const method = 'POST'
    const body = JSON.stringify(data)
    return request<{ result: boolean; message: string; data: { subscription: Subscription } }>(endpoint, { method, body })
  },

  cancel: (id: string) => {
    const endpoint = `/subscriptions/${id}/cancel`
    const method = 'POST'
    return request<Subscription>(endpoint, { method })
  },
}
