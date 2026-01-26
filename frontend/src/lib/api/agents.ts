import { request } from './request'
import { Agent, AgentFormData } from '@/types/agent'

export const agentsApi = {
  findAll: () => {
    const endpoint = '/users/agents'
    return request<Agent[]>(endpoint)
  },

  upsert: (data: AgentFormData) => {
    const endpoint = '/users/agents'
    const method = 'POST'
    const body = JSON.stringify(data)
    return request<Agent>(endpoint, { method, body })
  },
}

