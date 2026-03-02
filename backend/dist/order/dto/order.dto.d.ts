export declare class UtxoAmountItemDto {
    unit: string;
    quantity: string;
}
export declare class UtxoOutputDto {
    address: string;
    amount: UtxoAmountItemDto[];
    plutusData?: string | object;
}
export declare class UtxoInputDto {
    txHash: string;
    outputIndex: number;
}
export declare class UtxoDto {
    input: UtxoInputDto;
    output: UtxoOutputDto;
}
export declare class BuildLockTxDto {
    scriptAddress: string;
    ownersPkh: string[];
    threshold: number;
    recipientPkh: string;
    assets: {
        unit: string;
        quantity: string;
    }[];
    changeAddress: string;
    utxos: UtxoDto[];
}
export declare class BuildUnlockTxDto {
    scriptUtxo: UtxoDto;
    outputAddress: string;
    signingOwnersPkh: string[];
    threshold: number;
    collateral: UtxoDto;
    changeAddress: string;
    utxos: UtxoDto[];
}
export declare class ParseDatumDto {
    scriptUtxo: UtxoDto;
}
export declare class MergePartialTxDto {
    partialTxHex: string;
    secondSignerResultHex: string;
}
export declare class OrderConfirmDto {
    lockTxHash: string;
    scriptOutputIndex?: number;
    batchId: string;
    policyId?: string;
    recipientAddress: string;
    senderAddress: string;
    ownerAddresses: string[];
}
export declare class OrderCompleteDto {
    unlockTxHash: string;
    witnessCount: number;
    signedByAddress?: string;
    deliveryId?: number;
}
export declare class SavePartialTxDto {
    partialTxHex: string;
}
