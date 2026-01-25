import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    getNonce(address: string): Promise<{
        nonce: string;
    }>;
    verifyWallet(address: string, signature: string, key: string): Promise<{
        access_token: string;
        user: {
            id: string;
            address: string;
        };
    }>;
    private normalizeAddress;
    private verifySignature;
    validateUser(userId: string): Promise<{
        id: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
