export class MintProductDto {
  changeAddress!: string;
  assetName!: string;
  metadata?: Record<string, string>;
  receiver?: string;
  name?: string;
  image?: string;
  receivers?: string[];
  receiverLocations?: string;
  receiverCoordinates?: string;
  minterLocation?: string;
  minterCoordinates?: string;
  propertiesJson?: string;
  certUnit?: string;
  walletUtxos?: unknown[];
  utxoAddresses?: string[];
}

export class UpdateProductDto {
  changeAddress!: string;
  assetName!: string;
  metadata?: Record<string, string>;
  txHash?: string;
  name?: string;
  image?: string;
  receivers?: string[];
  receiverLocations?: string;
  receiverCoordinates?: string;
  minterLocation?: string;
  minterCoordinates?: string;
  propertiesJson?: string;
  certUnit?: string;
  walletUtxos?: unknown[];
  utxoAddresses?: string[];
}

export class RevokeProductDto {
  changeAddress!: string;
  assetName!: string;
  txHash?: string;
  walletUtxos?: unknown[];
  utxoAddresses?: string[];
}

export class BurnProductDto {
  changeAddress!: string;
  assetName!: string;
  txHash?: string;
  policyId?: string;
  walletUtxos?: unknown[];
  utxoAddresses?: string[];
}

export class MintConfirmDto {
  txHash!: string;
  assetName!: string;
  name!: string;
  image!: string;
  description?: string;
  minterProfileId!: number;
  standard?: string;
  properties?: object;
  metadata?: object;
  policyId?: string;
  receivers?: string[];
}

export class UpdateConfirmDto {
  txHash!: string;
  assetName!: string;
  profileId!: number;
  name?: string;
  description?: string;
  image?: string;
  standard?: string;
  properties?: object;
  metadata?: object;
  receivers?: string[];
}

export class RevokeConfirmDto {
  txHash!: string;
  assetName!: string;
  profileId!: number;
  receivers?: string[];
}

export class BurnConfirmDto {
  txHash!: string;
  assetName!: string;
  profileId!: number;
}

export class RemoveWarehouseItemDto {
  batchId!: string;
}

export class SubmitTxDto {
  signedTx?: string;
  signedTxBase64?: string;
}
