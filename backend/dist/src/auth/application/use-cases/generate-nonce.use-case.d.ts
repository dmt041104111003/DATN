import { ConfigService } from "../../../core/config/config.service";
import { NonceStorePort } from "../../domain/nonce-store.port";
export declare class GenerateNonceUseCase {
    private readonly config;
    private readonly nonceStore;
    constructor(config: ConfigService, nonceStore: NonceStorePort);
    execute(stakeAddress: string): string;
}
