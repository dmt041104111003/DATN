import { AuthService } from "./auth.service";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
}
