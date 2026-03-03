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
  properties: unknown;
  metadata: unknown;
  policyId: string | null;
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
  properties: object;
  metadata: object;
  mintTxHash: string;
  policyId?: string;
  minterProfileId: number;
}

export interface UpdateBatchParams {
  code: string;
  name?: string;
  description?: string | null;
  image?: string | null;
  standard?: string | null;
  properties: object;
  metadata: object;
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

