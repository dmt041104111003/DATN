import { PrismaService } from '../prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
export declare class FeedbackService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        productId: string;
        content: string;
        rating: number;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        productId: string;
        content: string;
        rating: number;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private findOneOwned;
    create(userId: string, dto: CreateFeedbackDto): Promise<{
        productId: string;
        content: string;
        rating: number;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, userId: string, dto: UpdateFeedbackDto): Promise<{
        productId: string;
        content: string;
        rating: number;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<{
        productId: string;
        content: string;
        rating: number;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
