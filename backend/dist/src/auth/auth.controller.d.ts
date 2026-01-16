import type { Response } from 'express';
import { AuthService } from './auth.service';
import { GetNonceDto, VerifyWalletDto } from './dto/verify-wallet.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    getNonce(dto: GetNonceDto): Promise<{
        nonce: string;
    }>;
    verifyWallet(dto: VerifyWalletDto, res: Response): Promise<{
        user: {
            id: string;
            address: string;
        };
    }>;
    logout(res: Response): {
        message: string;
    };
}
