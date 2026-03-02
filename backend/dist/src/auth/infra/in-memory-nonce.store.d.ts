import { NonceStorePort } from "../domain/nonce-store.port";
export declare class InMemoryNonceStore implements NonceStorePort {
    private readonly store;
    set(address: string, nonce: string): void;
    get(address: string): string | undefined;
    delete(address: string): void;
}
