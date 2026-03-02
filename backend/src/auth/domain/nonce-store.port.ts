export interface NonceStorePort {
  set(address: string, nonce: string): void;
  get(address: string): string | undefined;
  delete(address: string): void;
}

export const NONCE_STORE = "NONCE_STORE";

