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
            avatarUrl: string | null;
            location: string | null;
            coordinates: string | null;
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
    getProfileIdFromToken(token: string): Promise<number>;
    getProfileRoleFromToken(token: string): Promise<string>;
}
export {};
