export interface ProductBatchListItem {
  id: number;
  code: string;
  name: string;
  image: string | null;
  createdAt: Date;
  policyId: string | null;
}

export interface ProductBatchSnapshot {
  code: string;
  name: string;
  image: string | null;
  standard: string | null;
  properties: unknown;
  metadata: unknown;
}

export interface MintBatchParams {
  code: string;
  name: string;
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
    receivers: string[],
    txHash: string
  ): Promise<void>;
}

export const PRODUCT_REPOSITORY = "PRODUCT_REPOSITORY";

