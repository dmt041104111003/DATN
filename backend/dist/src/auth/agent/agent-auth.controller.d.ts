import type { Response } from 'express';
import { AuthService } from '../auth.service';
import { GetNonceDto, VerifyWalletDto } from '../dto/verify-wallet.dto';
export declare class AgentAuthController {
    private authService;
    constructor(authService: AuthService);
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
