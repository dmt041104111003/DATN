import type { Plutus } from "../types";
export type MultisigDatum = {
    ownersPkh: string[];
    threshold: number;
    recipientPkh: string;
};
export type MultisigContractOpts = {
    plutus?: Plutus;
    appNetwork?: "mainnet" | "preprod" | "preview";
    validatorTitle?: string;
};
export declare const REDEEMER_SPEND_CBOR = "d87980";
export declare const POLICY_ID_HEX_LENGTH = 56;
export declare const DEFAULT_SPEND_MEM = 14000000;
export declare const DEFAULT_SPEND_STEPS = 10000000000;
