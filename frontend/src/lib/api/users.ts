import { request } from './request'
import { User } from '@/types/auth'

export const usersApi = {
  getMe: () => {
    const endpoint = '/users/me'
    return request<User>(endpoint)
  },

  updateMe: (data: Partial<User>) => {
    const endpoint = '/users/me'
    const method = 'PATCH'
    const body = JSON.stringify(data)
    return request<User>(endpoint, { method, body })
  },

  deleteMe: () => {
    const endpoint = '/users/me'
    const method = 'DELETE'
    return request<{ message: string }>(endpoint, { method })
  },
}
