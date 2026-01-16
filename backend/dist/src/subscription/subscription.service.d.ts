import { PrismaService } from '../prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
export declare class SubscriptionService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateSubscriptionDto): Promise<{
        id: string;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateSubscriptionDto): Promise<{
        id: string;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
