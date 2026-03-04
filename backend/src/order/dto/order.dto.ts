export class UtxoAmountItemDto {
  unit!: string;
  quantity!: string;
}

export class UtxoOutputDto {
  address!: string;
  amount!: UtxoAmountItemDto[];
  plutusData?: string | object;
}

export class UtxoInputDto {
  txHash!: string;
  outputIndex!: number;
}

export class UtxoDto {
  input!: UtxoInputDto;
  output!: UtxoOutputDto;
}

export class BuildLockTxDto {
  scriptAddress!: string;
  ownersPkh!: string[];
  threshold!: number;
  recipientPkh!: string;
  assets!: { unit: string; quantity: string }[];
  changeAddress!: string;
  utxos!: UtxoDto[];
}

export class BuildUnlockTxDto {
  scriptUtxo!: UtxoDto;
  outputAddress!: string;
  signingOwnersPkh!: string[];
  threshold!: number;
  collateral!: UtxoDto;
  changeAddress!: string;
  utxos!: UtxoDto[];
}

export class ParseDatumDto {
  scriptUtxo!: UtxoDto;
}

export class MergePartialTxDto {
  partialTxHex!: string;
  secondSignerResultHex!: string;
}

export class OrderConfirmDto {
  lockTxHash!: string;
  scriptOutputIndex?: number;
  batchId!: string;
  policyId?: string;
  recipientAddress!: string;
  senderAddress!: string;
  ownerAddresses!: string[];
  scriptAddress?: string;
  datumHash?: string;
  datumJson?: unknown;
}

export class OrderCompleteDto {
  unlockTxHash!: string;
  witnessCount!: number;
  signedByAddress?: string;
  deliveryId?: number;
}

export class SavePartialTxDto {
  partialTxHex!: string;
}
