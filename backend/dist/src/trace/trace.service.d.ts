import { CardanoService } from "../cardano/cardano.service";
export type PolicyAssetRow = {
    assetName: string;
    ref100Unit: string | null;
    ref100Quantity: string;
    nft222Unit: string | null;
    nft222Quantity: string;
};
export type BuildMetadataInput = {
    pk: string;
    receivers: string;
    receiver_locations: string;
    receiver_coordinates: string;
    minter_location: string;
    minter_coordinates: string;
    name: string;
    image: string;
    properties?: string;
    standard?: string;
};
export declare class TraceService {
    private readonly cardano;
    constructor(cardano: CardanoService);
    private createContractForAddress;
    private hexToUtf8;
    private assetNameFromUnit;
    listAssetsByPolicy(policyId: string): Promise<PolicyAssetRow[]>;
    mint(params: {
        changeAddress: string;
        assetName: string;
        metadata: Record<string, string>;
        receiver?: string;
    }): Promise<{
        unsignedTx: string;
    }>;
    update(params: {
        changeAddress: string;
        assetName: string;
        metadata: Record<string, string>;
        txHash?: string;
    }): Promise<{
        unsignedTx: string;
    }>;
    burn(params: {
        changeAddress: string;
        assetName: string;
        quantity?: string;
        txHash?: string;
    }): Promise<{
        unsignedTx: string;
    }>;
    revoke(params: {
        changeAddress: string;
        assetName: string;
        txHash?: string;
    }): Promise<{
        unsignedTx: string;
    }>;
    submitSignedTx(signedTxHex: string): Promise<{
        txHash: string;
    }>;
    buildMetadata(opts: BuildMetadataInput): Record<string, string>;
}
