import { Injectable } from "@nestjs/common";
import { NonceStorePort } from "../domain/nonce-store.port";

@Injectable()
export class InMemoryNonceStore implements NonceStorePort {
  private readonly store = new Map<string, string>();

  set(address: string, nonce: string): void {
    this.store.set(address, nonce);
  }

  get(address: string): string | undefined {
    return this.store.get(address);
  }

  delete(address: string): void {
    this.store.delete(address);
  }
}

