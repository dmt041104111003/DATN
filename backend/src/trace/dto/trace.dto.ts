export class MintTraceDto {
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
  walletUtxos?: unknown[];
  utxoAddresses?: string[];
}

export class UpdateTraceDto {
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
  walletUtxos?: unknown[];
  utxoAddresses?: string[];
}

export class RevokeTraceDto {
  changeAddress!: string;
  assetName!: string;
  txHash?: string;
  walletUtxos?: unknown[];
  utxoAddresses?: string[];
}

export class MintConfirmDto {
  txHash!: string;
  assetName!: string;
  name!: string;
  image!: string;
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

export class SubmitTxDto {
  signedTx?: string;
  signedTxBase64?: string;
}

