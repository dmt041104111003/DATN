export interface ContractInfo {
  policyId: string
  storeAddress: string
}

export interface MintAsset {
  assetName: string
  metadata: Record<string, string>
  quantity?: string
  receiver?: string
}

export interface BurnAsset {
  assetName: string
  quantity: string
}

export interface UpdateAsset {
  assetName: string
  metadata: Record<string, string>
}

export interface ContractResponse {
  result: boolean
  data: string
  message?: string
}
