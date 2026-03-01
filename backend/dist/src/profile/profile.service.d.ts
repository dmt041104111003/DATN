import { ConfigService } from "../config/config.service";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "../auth/auth.service";
import { UploadService } from "../upload/upload.service";
export declare class ProfileService {
    private readonly config;
    private readonly prisma;
    private readonly auth;
    private readonly upload;
    constructor(config: ConfigService, prisma: PrismaService, auth: AuthService, upload: UploadService);
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
