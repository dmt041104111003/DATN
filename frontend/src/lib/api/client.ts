import { request } from './request'
import { 
  GetNonceResponse, 
  VerifyWalletRequest, 
  VerifyWalletResponse, 
  AuthMeResponse,
  Product,
  Material,
  Warehouse,
  Supplier,
  ProductQuota,
  Subscription,
  Service,
  Document,
  Certification,
  ProductionProcess,
  Media,
  WarehouseStorage,
  ProductMaterial,
  ContractInfo,
  MintAsset,
  BurnAsset,
  UpdateAsset,
  ContractResponse,
  User
} from '@/types/api'

export const apiClient = {
  auth: {
    getNonce: (address: string) => request<GetNonceResponse>(`/auth/nonce?address=${encodeURIComponent(address)}`),
    verifyWallet: (data: VerifyWalletRequest) => request<VerifyWalletResponse>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getMe: () => request<AuthMeResponse>('/auth/me'),
    logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
  },
  products: {
    findAll: () => request<Product[]>('/products'),
    findMy: () => request<Product[]>('/products/my'),
    findOne: (id: string) => request<Product>(`/products/${id}`),
    getQuota: () => request<ProductQuota>('/products/quota'),
    getHistory: (id: string) => request<any>(`/products/${id}/history`),
    trace: (policyId: string, assetName: string) => request<any>(`/products/trace/${policyId}/${assetName}`),
    create: (data: { name: string }) => request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Product>) => request<Product>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<{ success: boolean; message: string; wasMinted?: boolean; warning?: string | null }>(`/products/${id}`, { method: 'DELETE' }),
  },
  materials: {
    findAll: () => request<Material[]>('/materials'),
    findBySupplier: (supplierId: string) => request<Material[]>(`/materials/by-supplier/${supplierId}`),
    findOne: (id: string) => request<Material>(`/materials/${id}`),
    create: (data: { supplierId: string; name: string; harvestDate?: string; quantity?: number }) => 
      request<Material>('/materials', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Material>) => 
      request<Material>(`/materials/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<{ message: string }>(`/materials/${id}`, { method: 'DELETE' }),
  },
  warehouses: {
    findAll: () => request<Warehouse[]>('/warehouses'),
    findOne: (id: string) => request<Warehouse>(`/warehouses/${id}`),
    create: (data: { name: string; location?: string; capacity?: number }) => 
      request<Warehouse>('/warehouses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Warehouse>) => 
      request<Warehouse>(`/warehouses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<{ message: string }>(`/warehouses/${id}`, { method: 'DELETE' }),
  },
  suppliers: {
    findAll: () => request<Supplier[]>('/suppliers'),
    findOne: (id: string) => request<Supplier>(`/suppliers/${id}`),
    create: (data: { name: string; location?: string; gpsCoordinates?: string; contactInfo?: string }) => 
      request<Supplier>('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Supplier>) => 
      request<Supplier>(`/suppliers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<{ message: string }>(`/suppliers/${id}`, { method: 'DELETE' }),
  },
  subscriptions: {
    findAll: () => request<Subscription[]>('/subscriptions'),
    pay: (data: { servicePlanId: string; txHash: string }) => 
      request<{ result: boolean; message: string; data: { subscription: Subscription } }>('/subscriptions/pay', { 
        method: 'POST', 
        body: JSON.stringify(data) 
      }),
    cancel: (id: string) => request<Subscription>(`/subscriptions/${id}/cancel`, { method: 'POST' }),
  },
  services: {
    findAll: () => request<Service[]>('/services'),
    findOne: (id: string) => request<Service>(`/services/${id}`),
  },
  documents: {
    findAll: () => request<Document[]>('/documents'),
    findOne: (id: string) => request<Document>(`/documents/${id}`),
    create: (data: { productId: string; docType: string; url: string; hash?: string }) => 
      request<Document>('/documents', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Document>) => 
      request<Document>(`/documents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<{ message: string }>(`/documents/${id}`, { method: 'DELETE' }),
  },
  certifications: {
    findAll: () => request<Certification[]>('/certifications'),
    findOne: (id: string) => request<Certification>(`/certifications/${id}`),
    create: (data: { productId: string; certName: string; issueDate: string; expiryDate?: string; certHash?: string }) => 
      request<Certification>('/certifications', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Certification>) => 
      request<Certification>(`/certifications/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<{ message: string }>(`/certifications/${id}`, { method: 'DELETE' }),
  },
  productionProcesses: {
    findAll: () => request<ProductionProcess[]>('/production-processes'),
    findOne: (id: string) => request<ProductionProcess>(`/production-processes/${id}`),
    create: (data: { productId: string; stepName: string; startTime: string; endTime?: string; location?: string }) => 
      request<ProductionProcess>('/production-processes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<ProductionProcess>) => 
      request<ProductionProcess>(`/production-processes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<{ message: string }>(`/production-processes/${id}`, { method: 'DELETE' }),
  },
  media: {
    findAll: () => request<Media[]>('/media'),
    findOne: (id: string) => request<Media>(`/media/${id}`),
    upload: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return request<Media>('/media/upload', {
        method: 'POST',
        body: formData,
        headers: {},
      })
    },
    uploadBatch: (files: File[]) => {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))
      return request<{ successful: Media[]; failed: number; total: number }>('/media/upload/batch', {
        method: 'POST',
        body: formData,
        headers: {},
      })
    },
    update: (id: string, data: Partial<Media>) => 
      request<Media>(`/media/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<{ message: string }>(`/media/${id}`, { method: 'DELETE' }),
  },
  warehouseStorages: {
    findAll: () => request<WarehouseStorage[]>('/warehouse-storages'),
    findOne: (id: string) => request<WarehouseStorage>(`/warehouse-storages/${id}`),
    create: (data: { productId: string; warehouseId: string; entryTime: string; exitTime?: string; conditions?: string }) => 
      request<WarehouseStorage>('/warehouse-storages', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<WarehouseStorage>) => 
      request<WarehouseStorage>(`/warehouse-storages/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<{ message: string }>(`/warehouse-storages/${id}`, { method: 'DELETE' }),
  },
  productMaterials: {
    findByProduct: (productId: string) => request<ProductMaterial[]>(`/product-materials?productId=${productId}`),
    findOne: (id: string) => request<ProductMaterial>(`/product-materials/${id}`),
    create: (data: { productId: string; materialId: string; quantity: number; unit?: string }) => 
      request<ProductMaterial>('/product-materials', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<ProductMaterial>) => 
      request<ProductMaterial>(`/product-materials/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<{ message: string }>(`/product-materials/${id}`, { method: 'DELETE' }),
  },
  contract: {
    getInfo: (walletAddress: string) => request<ContractInfo>(`/contract/info?walletAddress=${encodeURIComponent(walletAddress)}`),
    prepareMetadata: (productId: string) => request<any>(`/contract/prepare-metadata/${productId}`),
    mint: (walletAddress: string, assets: MintAsset[]) => 
      request<ContractResponse>('/contract/mint', {
        method: 'POST',
        body: JSON.stringify({ walletAddress, assets }),
      }),
    burn: (walletAddress: string, assets: BurnAsset[]) => 
      request<ContractResponse>('/contract/burn', {
        method: 'POST',
        body: JSON.stringify({ walletAddress, assets }),
      }),
    update: (walletAddress: string, assets: UpdateAsset[], productId?: string) => 
      request<ContractResponse>('/contract/update', {
        method: 'POST',
        body: JSON.stringify({ walletAddress, assets, productId }),
      }),
    payment: (walletAddress: string, amount: string) => 
      request<ContractResponse>('/contract/payment', {
        method: 'POST',
        body: JSON.stringify({ walletAddress, amount }),
      }),
  },
  users: {
    getMe: () => request<User>('/users/me'),
    updateMe: (data: Partial<User>) => request<User>('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
    deleteMe: () => request<{ message: string }>('/users/me', { method: 'DELETE' }),
  },
}
