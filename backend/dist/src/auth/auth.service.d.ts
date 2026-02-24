import { ConfigService } from "../config/config.service";
type StakeAddress = string;
export declare class AuthService {
    private readonly config;
    private nonceStore;
    constructor(config: ConfigService);
    generateNonce(stakeAddress: StakeAddress): string;
    verifyAndIssueToken(params: {
        stakeAddress: StakeAddress;
        nonce: string;
        signature: string;
        key: string;
    }): {
        token: string;
    };
}
export {};
