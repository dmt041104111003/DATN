import { ConfigService } from "../core/config/config.service";
import { AuthService } from "../auth/auth.service";
import { ProfileRepositoryPort } from "./domain/profile.repository";
import { ListProfilesUseCase } from "./application/use-cases/list-profiles.use-case";
import { ListProfilesByRoleUseCase } from "./application/use-cases/list-profiles-by-role.use-case";
import { UpdateProfileUseCase } from "./application/use-cases/update-profile.use-case";
import { UploadProfileAvatarUseCase } from "./application/use-cases/upload-profile-avatar.use-case";
export declare class ProfileService {
    private readonly config;
    private readonly auth;
    private readonly profileRepository;
    private readonly listProfilesUseCase;
    private readonly listProfilesByRoleUseCase;
    private readonly updateProfileUseCase;
    private readonly uploadProfileAvatarUseCase;
    constructor(config: ConfigService, auth: AuthService, profileRepository: ProfileRepositoryPort, listProfilesUseCase: ListProfilesUseCase, listProfilesByRoleUseCase: ListProfilesByRoleUseCase, updateProfileUseCase: UpdateProfileUseCase, uploadProfileAvatarUseCase: UploadProfileAvatarUseCase);
    listProfilesFromToken(token: string): Promise<{
        walletAddress: string;
        displayName: string;
        location: string | null;
        coordinates: string | null;
        role: string | null;
    }[]>;
    listProfilesByRoleCode(roleCode: string): Promise<{
        id: number;
        displayName: string;
        walletAddress: string;
    }[]>;
    updateProfileFromToken(params: {
        token: string;
        displayName: string;
        location?: string;
        coordinates?: string;
    }): Promise<{
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
    uploadProfileAvatarFromToken(params: {
        token: string;
        imageDataUrl: string;
    }): Promise<{
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
