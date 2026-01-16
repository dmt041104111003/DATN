import { PrismaService } from '../prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
export declare class SubscriptionService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllByUser(userId: string): Promise<{
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(userId: string, dto: CreateSubscriptionDto): Promise<{
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, userId: string, dto: UpdateSubscriptionDto): Promise<{
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<{
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
