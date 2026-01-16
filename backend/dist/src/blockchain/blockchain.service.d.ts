export declare class BlockchainService {
    private blockfrost;
    private platformWallet;
    constructor();
    verifyPayment(txHash: string, expectedAmount: number): Promise<{
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
}
