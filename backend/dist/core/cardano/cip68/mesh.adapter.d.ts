import { MeshTxBuilder, MeshWallet } from "@meshsdk/core";
import type { UTxO, PlutusScript, IFetcher, IEvaluator } from "@meshsdk/core";
import type { Plutus } from "../../../shared/types";
import { VALIDATOR_TITLE } from "../../config/config.service";
import type { BlockfrostFetcher } from "../blockfrost.fetcher";
export type MeshAdapterDeps = {
    fetcher?: IFetcher;
    provider?: IEvaluator;
    blockfrostFetcher?: BlockfrostFetcher;
    plutus?: Plutus;
    appNetworkId?: number;
    title?: typeof VALIDATOR_TITLE;
};
export declare class MeshAdapter {
    protected meshTxBuilder: MeshTxBuilder;
    protected wallet: MeshWallet;
    protected fetcher: IFetcher;
    protected blockfrostFetcher: BlockfrostFetcher;
    protected pubKeyIssuer?: string;
    protected stakeCredentialHash?: string;
    protected mintCompileCode?: string;
    protected storeCompileCode?: string;
    protected storeScriptCbor?: string;
    protected storeScript?: PlutusScript;
    storeAddress?: string;
    storeScriptHash?: string;
    protected mintScriptCbor?: string;
    protected mintScript?: PlutusScript;
    policyId?: string;
    protected minterMintScriptCbor?: string;
    private _initPromise;
    constructor(opts?: {
        wallet?: MeshWallet;
        minterMintScriptCbor?: string;
    } & MeshAdapterDeps);
    init(plutusJson?: Plutus, appNetworkId?: number, title?: typeof VALIDATOR_TITLE): Promise<void>;
    getMintScriptCbor(): string | undefined;
    protected getWalletForTx: () => Promise<{
        utxos: UTxO[];
        collateral: UTxO;
        walletAddress: string;
    }>;
    protected getUtxoForTx: (address: string, txHash: string) => Promise<UTxO>;
    protected readValidator: (plutusJson: Plutus, validatorTitle: string) => string;
    protected getPolicyIdFromWalletRft: (walletAddress: string, rftSuffix: string) => Promise<string | undefined>;
    protected getUtxoContainingUnit: (unit: string) => Promise<UTxO | undefined>;
    protected getAddressUTXOAsset: (address: string, unit: string) => Promise<UTxO | undefined>;
    protected getAddressUTXOAssets: (address: string, unit: string) => Promise<UTxO[]>;
}
