import { DeliveryStatus } from "@prisma/client";

export interface DeliveryOrderRow {
  id: number;
  lockTxHash: string;
  scriptOutputIndex: number;
  batchId: string;
  policyId: string | null;
  scriptAddress: string | null;
  datumHash: string | null;
  datumJson: unknown | null;
  recipientAddress: string;
  senderAddress: string;
  ownerAddresses: string[];
  status: DeliveryStatus | string;
  partialSignedTxHex: string | null;
  partialSignedByAddress: string | null;
  secondSignedByAddress: string | null;
  unlockTxHash: string | null;
  actualDeliveryAt?: Date | null;
  updatedAt?: Date;
}

export interface OrderSummary {
  id: number;
  lockTxHash: string;
  scriptOutputIndex: number;
  batchId: string;
  policyId: string | null;
  scriptAddress: string | null;
  datumHash: string | null;
  datumJson: unknown | null;
  recipientAddress: string;
  senderAddress: string;
  ownerAddresses: string[];
  status: string;
  partialSignedTxHex: string | null;
  partialSignedByAddress: string | null;
  secondSignedByAddress: string | null;
  unlockTxHash: string | null;
  outAt: Date | null;
}

export interface OrderRecordParams {
  lockTxHash: string;
  scriptOutputIndex?: number;
  batchId: string;
  policyId?: string;
  scriptAddress?: string;
  datumHash?: string;
  datumJson?: unknown;
  recipientAddress: string;
  senderAddress: string;
  ownerAddresses: string[];
}

export interface CompleteOrderParams {
  unlockTxHash: string;
  witnessCount: number;
  signedByAddress?: string;
  deliveryId?: number;
}

export interface OrderRepositoryPort {
  findWalletAddressByProfileId(profileId: number): Promise<string | null>;

  findActiveDeliveriesForWallet(
    walletAddress: string
  ): Promise<DeliveryOrderRow[]>;

  savePartialSignedTx(
    deliveryId: number,
    walletAddress: string,
    partialTxHex: string
  ): Promise<void>;

  upsertDeliveryOrder(params: OrderRecordParams): Promise<{ id: number }>;

  findActiveDeliveryById(
    id: number
  ): Promise<{ id: number; batchId: string; recipientAddress: string } | null>;

  findActiveDeliveryByLockHashAndIndex(
    lockTxHash: string,
    scriptOutputIndex: number
  ): Promise<{
    id: number;
    batchId: string;
    recipientAddress: string;
  } | null>;

  markOrderDelivered(
    id: number,
    unlockTxHash: string,
    secondSignedByAddress: string | null
  ): Promise<void>;
}

export const ORDER_REPOSITORY = "ORDER_REPOSITORY";

