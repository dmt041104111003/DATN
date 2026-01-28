import { PrismaService } from './prisma.service';
import { RedisService } from './redis/redis.service';
export declare class AppService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    getUsers(): Promise<string | {
        id: string;
        address: string;
        walletName: string | null;
        displayName: string | null;
        location: string | null;
        gpsLatitude: number | null;
        gpsLongitude: number | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
