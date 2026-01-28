import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    getNonce(address: string): Promise<{
        nonce: string;
    }>;
    private assignEnterpriseRoleIfNone;
    verifyWallet(address: string, signature: string, key: string, walletName: string): Promise<{
        access_token: string;
        user: {
            id: string;
            address: string;
            walletName: string | null;
        };
    }>;
}
