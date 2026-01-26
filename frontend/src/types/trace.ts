import { Certification } from './certification'
import { Material } from './material'

export interface TraceProduct {
  id: string
  name: string
  policyId: string
  assetName: string
  historyHash: string
  certifications: Certification[]
  materials: Material[]
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
