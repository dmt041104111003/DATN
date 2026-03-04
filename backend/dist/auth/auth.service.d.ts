import { ConfigService } from "../core/config/config.service";
import { AuthRepositoryPort } from "./domain/auth.repository";
import { GenerateNonceUseCase } from "./application/use-cases/generate-nonce.use-case";
import { CreateProfileAndIssueTokenParams, CreateProfileAndIssueTokenUseCase } from "./application/use-cases/create-profile-and-issue-token.use-case";
import { VerifyAndIssueTokenParams, VerifyAndIssueTokenUseCase } from "./application/use-cases/verify-and-issue-token.use-case";
export declare class AuthService {
    private readonly config;
    private readonly authRepository;
    private readonly generateNonceUseCase;
    private readonly verifyAndIssueTokenUseCase;
    private readonly createProfileAndIssueTokenUseCase;
    constructor(config: ConfigService, authRepository: AuthRepositoryPort, generateNonceUseCase: GenerateNonceUseCase, verifyAndIssueTokenUseCase: VerifyAndIssueTokenUseCase, createProfileAndIssueTokenUseCase: CreateProfileAndIssueTokenUseCase);
    generateNonce(stakeAddress: string): string;
    verifyAndIssueToken(params: VerifyAndIssueTokenParams): Promise<{
        token: string;
        profile: {
            id: number;
            role: string;
            displayName: string;
            avatarUrl: string | null;
            location: string | null;
            coordinates: string | null;
        };
    } | {
        needProfile: true;
    }>;
    createProfileAndIssueToken(params: CreateProfileAndIssueTokenParams): Promise<{
        token: string;
        profile: {
            id: number;
            role: string;
            displayName: string;
            avatarUrl: string | null;
            location: string | null;
            coordinates: string | null;
        };
    }>;
    getProfileIdFromToken(token: string): Promise<number>;
    getProfileRoleFromToken(token: string): Promise<string>;
}
