import type { UTxO } from "@meshsdk/core";
export declare function createReadOnlyWallet(changeAddress: string, fetcher: {
    fetchAddressUTxOs: (address: string) => Promise<UTxO[]>;
}, walletUtxos?: UTxO[], utxoAddresses?: string[]): {
    getChangeAddress: () => Promise<string>;
    getUtxos: () => Promise<UTxO[]>;
    getCollateral: () => Promise<UTxO[]>;
};
export declare function mergeDbMeta(existing: unknown, patch: Record<string, unknown>): Record<string, unknown>;
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
export declare function buildMetadata(opts: BuildMetadataInput): Record<string, string>;
