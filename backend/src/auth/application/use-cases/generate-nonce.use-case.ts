import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { randomBytes } from "crypto";
import { ConfigService } from "../../../core/config/config.service";
import { isPaymentAddress, normalizeStakeAddress } from "../../utils";
import { NONCE_STORE, NonceStorePort } from "../../domain/nonce-store.port";

@Injectable()
export class GenerateNonceUseCase {
  constructor(
    private readonly config: ConfigService,
    @Inject(NONCE_STORE)
    private readonly nonceStore: NonceStorePort
  ) {}

  execute(stakeAddress: string): string {
    const network = this.config.appNetwork === "mainnet" ? "mainnet" : "preprod";
    const addr = normalizeStakeAddress(stakeAddress, network);

    if (!isPaymentAddress(addr)) {
      const hint =
        addr.length > 0
          ? ` Received: ${addr.slice(0, 30)}${addr.length > 30 ? "..." : ""}`
          : " Received empty or invalid type.";
      throw new BadRequestException(
        "Address must be a payment address (addr_test1... or addr1...) or a valid hex (56, 58 or 114 chars)." +
          hint,
      );
    }

    const nonce = randomBytes(32).toString("hex");
    this.nonceStore.set(addr, nonce);
    return nonce;
  }
}

