export declare class BlockchainService {
    private blockfrost;
    private platformWallet;
    constructor();
    verifyPayment(txHash: string, expectedAmount: number, maxRetries?: number, delayMs?: number): Promise<{
        valid: boolean;
        message: string;
        confirmedAmount?: number;
    }>;
    getTransactionInfo(txHash: string): Promise<{
        tx: {
            hash: string;
            block: string;
            block_height: number;
            block_time: number;
            slot: number;
            index: number;
            output_amount: {
                unit: string;
                quantity: string;
            }[];
            fees: string;
            deposit: string;
            size: number;
            invalid_before: string | null;
            invalid_hereafter: string | null;
            utxo_count: number;
            withdrawal_count: number;
            mir_cert_count: number;
            delegation_count: number;
            stake_cert_count: number;
            pool_update_count: number;
            pool_retire_count: number;
            asset_mint_or_burn_count: number;
            redeemer_count: number;
            valid_contract: boolean;
        };
        utxos: {
            hash: string;
            inputs: {
                address: string;
                amount: {
                    unit: string;
                    quantity: string;
                }[];
                tx_hash: string;
                output_index: number;
                data_hash: string | null;
                inline_datum: string | null;
                reference_script_hash: string | null;
                collateral: boolean;
                reference?: boolean;
            }[];
            outputs: {
                address: string;
                amount: {
                    unit: string;
                    quantity: string;
                }[];
                output_index: number;
                data_hash: string | null;
                inline_datum: string | null;
                collateral: boolean;
                reference_script_hash: string | null;
                consumed_by_tx?: string | null;
            }[];
        };
    } | null>;
    getAssetInfo(policyId: string, assetNameHex: string): Promise<{
        asset: string;
        policy_id: string;
        asset_name: string | null;
        fingerprint: string;
        quantity: string;
        initial_mint_tx_hash: string;
        mint_or_burn_count: number;
        onchain_metadata: {
            [key: string]: unknown;
        } | null;
        onchain_metadata_standard?: "CIP25v1" | "CIP25v2" | "CIP68v1" | "CIP68v2" | "CIP68v3" | null;
        onchain_metadata_extra?: string | null;
        metadata: {
            name: string;
            description: string;
            ticker: string | null;
            url: string | null;
            logo: string | null;
            decimals: number | null;
        } | null;
    } | null>;
    getAssetHistory(policyId: string, assetNameHex: string): Promise<({
        txHash: string;
        action: "minted" | "burned";
        amount: string;
        blockTime: number;
        blockHeight: number;
    } | {
        txHash: string;
        action: "minted" | "burned";
        amount: string;
        blockTime?: undefined;
        blockHeight?: undefined;
    })[]>;
    getAssetMetadata(policyId: string, assetNameHex: string): Promise<{
        datum: string;
        address: string;
    } | null>;
}
