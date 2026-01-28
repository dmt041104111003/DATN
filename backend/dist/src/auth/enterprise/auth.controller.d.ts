import type { Response } from 'express';
import { AuthService as EnterpriseAuthService } from './auth.service';
import { AuthService } from '../auth.service';
import { GetNonceDto, VerifyWalletDto } from '../dto/verify-wallet.dto';
export declare class AuthController {
    private enterpriseAuth;
    private authService;
    constructor(enterpriseAuth: EnterpriseAuthService, authService: AuthService);
    getNonce(dto: GetNonceDto): Promise<{
        nonce: string;
    }>;
    verifyWallet(dto: VerifyWalletDto, res: Response): Promise<{
        user: {
            id: string;
            address: string;
            walletName: string | null;
        };
    }>;
    getMe(user: {
        id: string;
        address: string;
    }): Promise<{
        user: {
            id: string;
            address: string;
            walletName: string | null;
            role: string | null;
        };
    }>;
    logout(res: Response): {
        message: string;
    };
}
