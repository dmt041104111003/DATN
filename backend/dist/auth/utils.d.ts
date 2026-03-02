export type StakeAddressInput = string | {
    address?: string;
} | undefined;
export declare function normalizeAddress(raw: StakeAddressInput): string | undefined;
export declare function isPaymentAddress(addr: string): boolean;
export declare function hexToBech32Address(hex: string, network: "mainnet" | "preprod"): string | null;
export declare function normalizeStakeAddress(stakeAddress: string, network: "mainnet" | "preprod"): string;
