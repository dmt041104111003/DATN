import type { Response } from 'express';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    private cookieConfig;
    private setAuthCookie;
    private clearAuthCookie;
    createNonce(body: any): Promise<{
        nonce: string;
    }>;
    verifySignature(body: any, res: Response): Promise<{
        needProfile: boolean;
        roles: {
            id: number;
            code: any;
            name: any;
        }[];
        token: string;
        profile?: undefined;
    } | {
        token: string;
        profile: {
            id: any;
            walletAddress: any;
            roleCode: any;
            displayName: any;
            phoneNumber: any;
            isActive: any;
            createdAt: any;
            updatedAt: any;
        };
        needProfile?: undefined;
        roles?: undefined;
    }>;
    logout(res: Response): Promise<{
        success: boolean;
    }>;
    getRoles(): Promise<{
        id: number;
        code: any;
        name: any;
    }[]>;
    getProfile(req: any): Promise<{
        user: any;
        profile: {
            id: any;
            walletAddress: any;
            roleCode: string;
            displayName: any;
        };
    }>;
    private normalizeAddress;
}
