import { ConfigService } from "../config/config.service";
import { PrismaService } from "../prisma/prisma.service";
type StakeAddress = string;
export declare class AuthService {
    private readonly config;
    private readonly prisma;
    private nonceStore;
    constructor(config: ConfigService, prisma: PrismaService);
    generateNonce(stakeAddress: StakeAddress): string;
    verifyAndIssueToken(params: {
        stakeAddress: StakeAddress;
        nonce: string;
        signature: string;
        key: string;
    }): Promise<{
        token: string;
        profile: {
            id: number;
            role: string;
            displayName: string;
            glnCodeRoot: string;
            avatarUrl: string | null;
        };
    } | {
        needProfile: true;
        roles: {
            id: number;
            code: string;
        }[];
    }>;
    createProfileAndIssueToken(params: {
        stakeAddress: StakeAddress;
        roleId: number;
        displayName: string;
        glnCodeRoot: string;
    }): Promise<{
        token: string;
        profile: {
            id: number;
            role: string;
            displayName: string;
            glnCodeRoot: string;
            avatarUrl: string | null;
        };
    }>;
    updateProfileFromToken(params: {
        token: string;
        displayName: string;
        glnCodeRoot: string;
    }): Promise<{
        token: string;
        profile: {
            id: number;
            role: string;
            displayName: string;
            glnCodeRoot: string;
            avatarUrl: string | null;
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
            glnCodeRoot: string;
            avatarUrl: string | null;
        };
    }>;
}
export {};
