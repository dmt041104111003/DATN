import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { UpdateMediaDto } from './dto/update-media.dto';
export declare class MediaService {
    private prisma;
    private redis;
    private ipfs;
    private subscriptionService;
    constructor(prisma: PrismaService, redis: RedisService, ipfs: IpfsService, subscriptionService: SubscriptionService);
    private checkSubscriptionActive;
    findAllByUser(userId: string): Promise<string | {
        gatewayUrl: string;
        id: string;
        userId: string;
        name: string;
        type: string;
        url: string;
        mediaHash: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        userId: string;
        name: string;
        type: string;
        url: string;
        gatewayUrl: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    uploadToIpfs(userId: string, file: Express.Multer.File): Promise<any>;
    uploadBatchToIpfs(userId: string, files: Express.Multer.File[]): Promise<{
        successful: any[];
        failed: number;
        total: number;
    }>;
    update(id: string, userId: string, dto: UpdateMediaDto): Promise<{
        id: string;
        userId: string;
        name: string;
        type: string;
        url: string;
        mediaHash: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<void>;
    private getFileType;
}
