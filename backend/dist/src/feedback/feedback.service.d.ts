import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
export declare class FeedbackService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    findAll(): Promise<string | {
        id: string;
        userId: string;
        productId: string;
        content: string;
        rating: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        userId: string;
        productId: string;
        content: string;
        rating: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private findOneOwned;
    create(userId: string, dto: CreateFeedbackDto): Promise<{
        id: string;
        userId: string;
        productId: string;
        content: string;
        rating: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, userId: string, dto: UpdateFeedbackDto): Promise<{
        id: string;
        userId: string;
        productId: string;
        content: string;
        rating: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<void>;
}
