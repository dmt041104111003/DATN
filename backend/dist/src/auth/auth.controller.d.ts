import { AuthService } from "./auth.service";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    listProfiles(token?: string): Promise<{
        walletAddress: string;
        displayName: string;
        location: string | null;
        coordinates: string | null;
    }[]>;
    listProfilesByRole(role?: string, token?: string): Promise<{
        id: number;
        displayName: string;
        walletAddress: string;
    }[]>;
    createNonce(stakeAddress?: string | {
        address?: string;
    }): {
        nonce: string;
    };
    verifySignature(body: {
        stakeAddress?: string | {
            address?: string;
        };
        nonce?: string;
        signature?: string;
        key?: string;
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
    createProfile(body: {
        stakeAddress?: string | {
            address?: string;
        };
        roleId?: number;
        displayName?: string;
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
    updateProfile(body: {
        token?: string;
        displayName?: string;
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
    uploadAvatar(body: {
        token?: string;
        imageDataUrl?: string;
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
