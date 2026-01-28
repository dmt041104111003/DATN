import type { Response } from 'express';
import { AgentAuthService } from './auth.service';
import { GetNonceDto, VerifyWalletDto } from '../dto/verify-wallet.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AgentAuthService);
    getAgentNonce(dto: GetNonceDto): Promise<{
        nonce: string;
    }>;
    verifyAgentWallet(dto: VerifyWalletDto, res: Response): Promise<{
        user: {
            id: string;
            address: string;
            walletName: string | null;
        };
    }>;
}
