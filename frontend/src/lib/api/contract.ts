import { request } from './request'
import { ContractInfo, MintAsset, BurnAsset, UpdateAsset, ContractResponse } from '@/types/contract'

export const contractApi = {
  getInfo: (walletAddress: string) => {
    const endpoint = `/contract/info?walletAddress=${encodeURIComponent(walletAddress)}`
    return request<ContractInfo>(endpoint)
  },

  prepareMetadata: (productId: string) => {
    const endpoint = `/contract/prepare-metadata/${productId}`
    return request<Record<string, unknown>>(endpoint)
  },

  mint: (walletAddress: string, assets: MintAsset[]) => {
    const endpoint = '/contract/mint'
    const method = 'POST'
    const body = JSON.stringify({ walletAddress, assets })
    return request<ContractResponse>(endpoint, { method, body })
  },

  burn: (walletAddress: string, assets: BurnAsset[]) => {
    const endpoint = '/contract/burn'
    const method = 'POST'
    const body = JSON.stringify({ walletAddress, assets })
    return request<ContractResponse>(endpoint, { method, body })
  },

  update: (walletAddress: string, assets: UpdateAsset[], productId?: string) => {
    const endpoint = '/contract/update'
    const method = 'POST'
    const body = JSON.stringify({ walletAddress, assets, productId })
    return request<ContractResponse>(endpoint, { method, body })
  },

  payment: (walletAddress: string, amount: string) => {
    const endpoint = '/contract/payment'
    const method = 'POST'
    const body = JSON.stringify({ walletAddress, amount })
    return request<ContractResponse>(endpoint, { method, body })
  },
}
