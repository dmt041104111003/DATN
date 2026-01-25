import { User } from './auth'

export interface GetNonceResponse {
  nonce: string
}

export interface VerifyWalletRequest {
  address: string
  signature: string
  key: string
  walletName: string
}

export interface VerifyWalletResponse {
  user: User
}

export interface AuthMeResponse {
  user: User
}

export interface Product {
  id: string
  userId: string
  policyId?: string
  assetName?: string
  name: string
  historyHash?: string
  createdAt: string
  updatedAt: string
}

export interface Material {
  id: string
  userId: string
  supplierId: string
  name: string
  harvestDate?: string
  quantity: number
  createdAt: string
  updatedAt: string
  supplier?: Supplier
}

export interface Collection {
  id: string
  userId: string
  name: string
  description?: string
  thumbnail?: string
  createdAt: string
  updatedAt: string
}

export interface Warehouse {
  id: string
  name: string
  location?: string
  capacity: number
  createdAt: string
  updatedAt: string
}

export interface Supplier {
  id: string
  userId: string
  name: string
  location?: string
  gpsCoordinates?: string
  contactInfo?: string
  createdAt: string
  updatedAt: string
}

export interface ProductQuota {
  tier: string
  maxProducts: number | null
  usedProducts: number
  remainingProducts: number | string
}

export interface Subscription {
  id: string
  userId: string
  servicePlanId: string
  status: string
  startDate?: string
  endDate?: string
  amount: number
  currency: string
  txHash?: string
  paymentDate: string
  createdAt: string
  updatedAt: string
  service?: Service
}

export interface Service {
  id: string
  name: string
  description?: string
  price: number
  duration: number
  maxProducts?: number | null
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: string
  productId: string
  docType: string
  url: string
  hash?: string
  createdAt: string
  updatedAt: string
}

export interface Certification {
  id: string
  productId: string
  certName: string
  issueDate: string
  expiryDate?: string
  certHash?: string
  createdAt: string
  updatedAt: string
}

export interface ProductionProcess {
  id: string
  productId: string
  stepName: string
  startTime: string
  endTime?: string
  location?: string
  createdAt: string
  updatedAt: string
}

export interface Metadata {
  id: string
  collectionId: string
  assetName?: string
  content: string
  nftReference?: string[]
  createdAt: string
  updatedAt: string
}

export interface Media {
  id: string
  userId: string
  name: string
  type: string
  url: string
  createdAt: string
  updatedAt: string
}

export interface WarehouseStorage {
  id: string
  productId: string
  warehouseId: string
  entryTime: string
  exitTime?: string
  conditions?: string
  createdAt: string
  updatedAt: string
}


export interface ProductMaterial {
  id: string
  productId: string
  materialId: string
  quantity: number
  unit?: string
  createdAt: string
  updatedAt: string
}

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
  data: any
  message: string
}

export interface User {
  id: string
  address: string
  createdAt?: string
  updatedAt?: string
}
