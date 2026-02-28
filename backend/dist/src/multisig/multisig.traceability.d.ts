import type { UTxO } from "@meshsdk/core";
import type { MultisigDatum } from "./multisig.types";
export declare function parseMultisigDatumFromUtxo(utxo: UTxO): Promise<MultisigDatum>;
export declare function getAllowedPkhsFromRef100ByNftUnit(nftUnit222: string): Promise<string[]>;
export declare function assertRecipientAllowedByRef100(recipientPkh: string, nftUnit222: string): Promise<void>;
