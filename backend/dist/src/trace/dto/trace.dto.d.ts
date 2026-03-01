export declare class MintTraceDto {
    changeAddress: string;
    assetName: string;
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
export declare class UpdateTraceDto {
    changeAddress: string;
    assetName: string;
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
export declare class RevokeTraceDto {
    changeAddress: string;
    assetName: string;
    txHash?: string;
    walletUtxos?: unknown[];
    utxoAddresses?: string[];
}
export declare class MintConfirmDto {
    txHash: string;
    assetName: string;
    name: string;
    image: string;
    minterProfileId: number;
    standard?: string;
    properties?: object;
    metadata?: object;
}
export declare class UpdateConfirmDto {
    txHash: string;
    assetName: string;
    profileId: number;
    name?: string;
    image?: string;
    standard?: string;
    properties?: object;
    metadata?: object;
}
export declare class RevokeConfirmDto {
    txHash: string;
    assetName: string;
    profileId: number;
}
export declare class SubmitTxDto {
    signedTx?: string;
    signedTxBase64?: string;
}
