export interface NonceStorePort {
    set(address: string, nonce: string): void;
    get(address: string): string | undefined;
    delete(address: string): void;
}
export declare const NONCE_STORE = "NONCE_STORE";
