export interface TraceProduct {
  id: string
  name: string
  policyId: string
  assetName: string
  historyHash: string
  documents: any[]
  productionProcesses: any[]
  certifications: any[]
  warehouseStorages: any[]
  materials: any[]
  owner: string
  createdAt: string
  updatedAt: string
}

export interface TraceBlockchain {
  policyId: string
  assetName: string
  assetInfo: any
  onChainMetadata: any
}

export interface TraceResult {
  product: TraceProduct | null
  blockchain: TraceBlockchain
}
