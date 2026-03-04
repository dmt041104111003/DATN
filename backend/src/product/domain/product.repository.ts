export interface ProductBatchListItem {
  id: number;
  code: string;
  name: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
  policyId: string | null;
}

export interface ProductBatchSnapshot {
  code: string;
  name: string;
  description: string | null;
  image: string | null;
  standard: string | null;
  policyId: string | null;
  expiryDate: Date | null;
  lastUpdateTxHash: string | null;
  lastUpdateAt: Date | null;
  revokeTxHash: string | null;
  revokedAt: Date | null;
  revoked: boolean;
  burnTxHash: string | null;
  burnedAt: Date | null;
  burned: boolean;
}

export interface ProductRoadmapHop {
  hopIndex: number;
  senderAddress: string | null;
  receiverAddress: string | null;
}

export interface MintBatchParams {
  code: string;
  name: string;
  description: string | null;
  image: string | null;
  standard: string;
  mintTxHash: string;
  policyId?: string;
  minterProfileId: number;
  expiryDate?: Date | string | null;
}

export interface UpdateBatchParams {
  code: string;
  name?: string;
  description?: string | null;
  image?: string | null;
  standard?: string | null;
  expiryDate?: Date | string | null;
  lastUpdateTxHash?: string | null;
  lastUpdateAt?: Date | string | null;
}

export interface ProductRepositoryPort {
  listBatchesByMinter(
    profileId: number
  ): Promise<ProductBatchListItem[]>;

  upsertBatchOnMint(params: MintBatchParams): Promise<void>;

  findBatchByCode(code: string): Promise<ProductBatchSnapshot | null>;

  getMinterWalletAddressByBatchCode(code: string): Promise<string | null>;

  updateBatch(params: UpdateBatchParams): Promise<void>;

  markBatchRevoked(
    code: string,
    nextMetadata: object
  ): Promise<void>;

  markBatchBurned(
    code: string,
    nextMetadata: object
  ): Promise<void>;

  createRoadmaps(
    batchId: string,
    action: "MINT" | "UPDATE" | "REVOKE",
    senderAddress: string,
    receivers: string[],
    txHash: string
  ): Promise<void>;

  listRoadmap(
    batchId: string
  ): Promise<ProductRoadmapHop[]>;
}

export const PRODUCT_REPOSITORY = "PRODUCT_REPOSITORY";

