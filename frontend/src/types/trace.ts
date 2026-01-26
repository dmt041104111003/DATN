import { Certification } from './certification'
import { Material } from './material'

export interface TraceProduct {
  id: string
  name: string
  policyId: string
  assetName: string
  certifications: Certification[]
  materials: Array<{
    name: string
    quantity: number
    unit?: string
    harvestDate?: string
    supplier: {
      name: string
      location?: string
    }
  }>
  owner: string
  createdAt: string
  updatedAt: string
}

export interface TraceBlockchain {
  policyId: string
  assetName: string
  assetInfo: Record<string, unknown>
  onChainMetadata: Record<string, unknown>
}

export interface TraceResult {
  product: TraceProduct | null
  blockchain: TraceBlockchain
}
