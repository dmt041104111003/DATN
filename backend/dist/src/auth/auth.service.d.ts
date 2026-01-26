import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private redis;
    constructor(prisma: PrismaService, jwtService: JwtService, redis: RedisService);
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
    validateUser(userId: string): Promise<{
        id: string;
        address: string;
        walletName: string | null;
        role: string | null;
    } | null>;
}
