export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'MANUFACTURER' | 'AGENT';

export interface User extends BaseEntity {
  address: string;
  role: UserRole;
  name?: string;
  registryTxHash?: string;
  agentProfile?: AgentProfile | null;
}

export interface AgentProfile {
  id: string;
  name: string;
  business: {
    id: string;
    address: string;
    name?: string;
  };
}


export interface Product extends BaseEntity {
  userId: string;
  policyId?: string;
  assetName?: string;
  name: string;
  imageUrl?: string;
  description?: string;
  historyHash?: string;
  productMaterials?: ProductMaterial[];
  productCertifications?: ProductCertification[];
}

export interface CreateProductInput {
  name: string;
  imageUrl?: string;
  description?: string;
  materialIds: string[];
  certificationIds: string[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface Supplier extends BaseEntity {
  userId: string;
  name: string;
  location?: string;
  contactInfo?: string;
}

export interface CreateSupplierInput {
  name: string;
  location?: string;
  contactInfo?: string;
}

export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {}

export interface Material extends BaseEntity {
  supplierId: string;
  name: string;
  harvestDate?: string;
  quantity: number;
  supplier?: Supplier;
}

export interface CreateMaterialInput {
  supplierId: string;
  name: string;
  harvestDate?: string;
  quantity?: number;
}

export interface UpdateMaterialInput extends Partial<CreateMaterialInput> {}

export interface AuthNonce {
  nonce: string;
}

export interface AuthUser {
  access_token: string;
  user: User;
}

export interface TraceMaterial {
  name: string;
  quantity: number;
  unit?: string;
  harvestDate?: string;
  supplier?: {
    name: string;
    location?: string;
  } | null;
}

export interface TraceProcess {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface TraceCertification {
  id: string;
  name: string;
  issuer?: string;
  issuedDate?: string;
  expiryDate?: string;
}

export interface TraceProduct {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  productionProcesses: TraceProcess[];
  certifications: TraceCertification[];
  materials: TraceMaterial[];
  owner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TraceBlockchain {
  policyId: string;
  assetName: string;
  assetInfo?: Record<string, unknown>;
  onChainMetadata?: Record<string, unknown>;
}

export interface TraceResult {
  product: TraceProduct | null;
  blockchain: TraceBlockchain;
}

export interface Media extends BaseEntity {
  userId: string;
  name: string;
  type: string;
  url: string;
}

export interface CreateMediaInput {
  name: string;
  type: string;
  url: string;
}

export interface UpdateMediaInput extends Partial<CreateMediaInput> {}

export interface ProductMaterial extends BaseEntity {
  productId: string;
  materialId: string;
  quantity: number;
  unit?: string;
  material: Material & { supplier: Supplier };
  product?: Product;
}

export interface CreateProductMaterialInput {
  productId: string;
  materialId: string;
  quantity: number;
  unit?: string;
}

export interface UpdateProductMaterialInput extends Partial<Omit<CreateProductMaterialInput, 'productId' | 'materialId'>> {}

export interface ProductionProcess extends BaseEntity {
  productId: string;
  stepName: string;
  startTime: string;
  endTime?: string;
  location?: string;
  product?: Product;
}

export interface CreateProductionProcessInput {
  productId: string;
  stepName: string;
  startTime: string;
  endTime?: string;
  location?: string;
}

export interface UpdateProductionProcessInput extends Partial<Omit<CreateProductionProcessInput, 'productId'>> {}

export interface Certification extends BaseEntity {
  userId: string;
  certName: string;
  issueDate: string;
  expiryDate?: string;
  certHash: string;
}

export interface CreateCertificationInput {
  certName: string;
  issueDate: string;
  expiryDate?: string;
  certHash: string;
}

export interface UpdateCertificationInput extends Partial<CreateCertificationInput> {}

export interface ProductCertification extends BaseEntity {
  productId: string;
  certificationId: string;
  certification?: Certification;
}

export interface Agent extends BaseEntity {
  businessId: string;
  userId?: string;
  name: string;
  address: string;
  location?: string;
  gpsCoordinates?: string;
  contactInfo?: string;
  isActive: boolean;
  addAgentTxHash?: string;
  business?: {
    id: string;
    address: string;
    name?: string;
  };
  user?: {
    id: string;
    address: string;
    name: string | null;
    role: UserRole | null;
  };
}

export interface CreateAgentInput {
  name: string;
  address: string;
  location?: string;
  gpsCoordinates?: string;
  contactInfo?: string;
  addAgentTxHash?: string;
}

export interface UpdateAgentInput {
  name?: string;
  location?: string;
  gpsCoordinates?: string;
  contactInfo?: string;
  isActive?: boolean;
}

export type BatchStatus = 'CREATED' | 'MINTED' | 'IN_TRANSIT' | 'DELIVERED' | 'SOLD_OUT';

export interface BatchRoadmap extends BaseEntity {
  batchId: string;
  stepOrder: number;
  agentId: string;
  location: string;
  gpsCoordinates?: string;
  isCompleted: boolean;
  completedAt?: string;
  confirmGps?: string;
  confirmTxHash?: string;
  agent?: Agent;
}

export interface Batch extends BaseEntity {
  businessId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  policyId?: string;
  assetName?: string;
  mintTxHash?: string;
  initialQuantity: number;
  currentQuantity: number;
  unit: string;
  productionDate?: string;
  expiryDate?: string;
  status: BatchStatus;
  currentStep?: number;
  productId: string;
  metadata?: Record<string, string>;
  business?: {
    id: string;
    address: string;
    name?: string;
  };
  product?: Product;
  shipments?: Shipment[];
  roadmap?: BatchRoadmap[];
  _count?: {
    shipments: number;
    roadmap: number;
  };
}

export interface CreateBatchInput {
  name: string;
  description?: string;
  imageUrl?: string;
  initialQuantity: number;
  unit?: string;
  productionDate?: string;
  expiryDate?: string;
  productId: string;
  policyId?: string;
  assetName?: string;
  mintTxHash?: string;
  originGps?: string;
  roadmapAgentIds: string[];
}

export interface UpdateBatchInput {
  name?: string;
  description?: string;
  imageUrl?: string;
  currentQuantity?: number;
  productionDate?: string;
  expiryDate?: string;
  status?: BatchStatus;
}

export interface MintBatchInput {
  policyId: string;
  assetName: string;
  mintTxHash: string;
}

export type ShipmentStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
export type SenderType = 'BUSINESS' | 'AGENT';

export interface Shipment extends BaseEntity {
  batchId: string;
  senderType: SenderType;
  senderAgentId?: string;
  receiverAgentId: string;
  receiverUserId?: string;
  quantity: number;
  destination: string;
  status: ShipmentStatus;
  createTxHash?: string;
  confirmTxHash?: string;
  cancelTxHash?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  batch?: Batch;
  senderAgent?: Agent;
  receiverAgent?: Agent;
}

export interface CreateShipmentInput {
  batchId: string;
  receiverAgentId: string;
  quantity?: number;
  destination: string;
  createTxHash?: string;
}

export interface ConfirmShipmentInput {
  confirmTxHash: string;
  gpsCoordinates?: string;
}

export interface CancelShipmentInput {
  cancelTxHash: string;
}

export type MovementAction = 'PRODUCED' | 'SHIPPED' | 'RECEIVED' | 'SOLD';

export interface RoadmapEntry {
  id: string;
  stepOrder: number;
  location: string;
  gpsCoordinates?: string;
  isCompleted: boolean;
  completedAt?: string;
  confirmGps?: string;
  confirmTxHash?: string;
  timestamp: string;
  action?: MovementAction;
  quantityIn: number;
  quantityOut: number;
  quantitySold: number;
  txHash?: string;
  agent: {
    id: string;
    name: string;
    location?: string;
    gpsCoordinates?: string;
    walletAddress?: string;
  } | null;
}

export type TraceRoadmapEntry = RoadmapEntry;

export interface TraceBatch {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  initialQuantity: number;
  currentQuantity: number;
  unit: string;
  productionDate?: string;
  expiryDate?: string;
  status: BatchStatus;
  currentStep: number;
}

export interface TraceBatchResult {
  batch: TraceBatch;
  business: {
    id: string;
    address: string;
    name?: string;
    gpsCoordinates?: string;
  };
  product: TraceProduct | null;
  roadmap: TraceRoadmapEntry[];
  blockchain: {
    policyId?: string;
    assetName?: string;
    mintTxHash?: string;
  };
}

export interface MintAsset {
  assetName: string;
  quantity?: string;
  receiver?: string;
  metadata: Record<string, unknown>;
}

export interface BurnAsset {
  assetName: string;
  quantity?: string;
}
