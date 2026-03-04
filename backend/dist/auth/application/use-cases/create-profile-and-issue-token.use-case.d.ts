import { ConfigService } from "../../../core/config/config.service";
import { AuthRepositoryPort } from "../../domain/auth.repository";
type StakeAddress = string;
export interface CreateProfileAndIssueTokenParams {
    stakeAddress: StakeAddress;
    roleCode: string;
    displayName: string;
    location?: string;
    coordinates?: string;
}
export declare class CreateProfileAndIssueTokenUseCase {
    private readonly config;
    private readonly authRepository;
    constructor(config: ConfigService, authRepository: AuthRepositoryPort);
    execute(params: CreateProfileAndIssueTokenParams): Promise<{
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
}
export {};
