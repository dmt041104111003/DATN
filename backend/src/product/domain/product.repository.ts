export interface ProductBatchListItem {
  id: number;
  code: string;
  name: string;
<<<<<<< HEAD
  description: string | null;
=======
>>>>>>> 69ccb5ee5f7e43f7dd7814ed74c72c1ef60b05c8
  image: string | null;
  createdAt: Date;
  policyId: string | null;
}

export interface ProductBatchSnapshot {
  code: string;
  name: string;
<<<<<<< HEAD
  description: string | null;
=======
>>>>>>> 69ccb5ee5f7e43f7dd7814ed74c72c1ef60b05c8
  image: string | null;
  standard: string | null;
  properties: unknown;
  metadata: unknown;
}

<<<<<<< HEAD
export interface ProductRoadmapHop {
  hopIndex: number;
  receiverAddress: string | null;
}

export interface MintBatchParams {
  code: string;
  name: string;
  description: string | null;
=======
export interface MintBatchParams {
  code: string;
  name: string;
>>>>>>> 69ccb5ee5f7e43f7dd7814ed74c72c1ef60b05c8
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
<<<<<<< HEAD
  description?: string | null;
=======
>>>>>>> 69ccb5ee5f7e43f7dd7814ed74c72c1ef60b05c8
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
<<<<<<< HEAD

  listRoadmap(
    batchId: string
  ): Promise<ProductRoadmapHop[]>;
=======
>>>>>>> 69ccb5ee5f7e43f7dd7814ed74c72c1ef60b05c8
}

export const PRODUCT_REPOSITORY = "PRODUCT_REPOSITORY";

