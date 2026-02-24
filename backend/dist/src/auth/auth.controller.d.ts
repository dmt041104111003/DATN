import { AuthService } from "./auth.service";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    createNonce(stakeAddress?: string): {
        nonce: string;
    };
    verifySignature(body: {
        stakeAddress?: string;
        nonce?: string;
        signature?: string;
        key?: string;
    }): Promise<{
        token: string;
        profile: {
            id: number;
            role: string;
            displayName: string;
            glnCodeRoot: string;
        };
    } | {
        needProfile: true;
        roles: {
            id: number;
            code: string;
        }[];
    }>;
    createProfile(body: {
        stakeAddress?: string;
        roleId?: number;
        displayName?: string;
        glnCodeRoot?: string;
    }): Promise<{
        token: string;
        profile: {
            id: number;
            role: string;
            displayName: string;
            glnCodeRoot: string;
        };
    }>;
}
