import { request } from './request'
import { TraceResult } from '@/types/trace'

export const productsApi = {
  trace: (policyId: string, assetName: string) => {
    const endpoint = `/products/trace/${policyId}/${assetName}`
    return request<TraceResult>(endpoint)
  },
}
