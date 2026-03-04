import { ConfigService } from "../../../core/config/config.service";
import { AuthRepositoryPort } from "../../domain/auth.repository";
import { NonceStorePort } from "../../domain/nonce-store.port";
type StakeAddress = string;
export interface VerifyAndIssueTokenParams {
    stakeAddress: StakeAddress;
    nonce: string;
    signature: string;
    key: string;
}
export declare class VerifyAndIssueTokenUseCase {
    private readonly config;
    private readonly authRepository;
    private readonly nonceStore;
    constructor(config: ConfigService, authRepository: AuthRepositoryPort, nonceStore: NonceStorePort);
    execute(params: VerifyAndIssueTokenParams): Promise<{
        needProfile: true;
        roles: import("../../domain/auth.repository").RoleOption[];
        token?: undefined;
        profile?: undefined;
    } | {
        token: string;
        profile: {
            id: number;
            role: string;
            displayName: string;
            avatarUrl: string | null;
            location: string | null;
            coordinates: string | null;
        };
        needProfile?: undefined;
        roles?: undefined;
    }>;
}
export {};
