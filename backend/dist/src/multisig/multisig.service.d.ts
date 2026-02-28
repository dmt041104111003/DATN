import { MultisigContract } from "./multisig.contract";
export declare class MultisigService {
    private _contract;
    getContract(): MultisigContract;
    getScriptAddress(): string;
    getScriptCbor(): string;
}
