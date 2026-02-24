export declare function buildRef100Unit(policyId: string, assetName: string): string;
export declare function datumToJson(datum: string, option?: {
    contain_pk?: boolean;
}): Promise<unknown>;
export declare function getPkHash(datum: string): Promise<string | null>;
export declare function decodeReceivers(receiversStr: string | undefined): {
    pubKeyHash: string;
}[];
export declare function ensureReceiversRaw(metadata: Record<string, string>): Record<string, string>;
export declare function metadataForDatum(metadata: Record<string, string>): Record<string, string>;
export declare function parseHttpErrorCip68(error: unknown): string;
