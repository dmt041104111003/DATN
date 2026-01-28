export interface TraceProduct {
  id: string
  name: string
  policyId: string
  assetName: string
  certifications: Array<{
    id: string
    certName: string
    issueDate: string
    expiryDate?: string
  }>
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
  assetInfo: Record<string, unknown> | null
  onChainMetadata: Record<string, unknown> | null
}

export interface TraceResult {
  product: TraceProduct | null
  blockchain: TraceBlockchain
}
