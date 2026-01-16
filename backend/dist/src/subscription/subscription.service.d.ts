import { PrismaService } from '../prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
export declare class SubscriptionService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllByUser(userId: string): Promise<({
        service: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
        };
    } & {
        id: string;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string, userId: string): Promise<{
        service: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
        };
    } & {
        id: string;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(userId: string, dto: CreateSubscriptionDto): Promise<{
        service: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
        };
    } & {
        id: string;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, userId: string, dto: UpdateSubscriptionDto): Promise<{
        service: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
        };
    } & {
        id: string;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    cancel(id: string, userId: string): Promise<{
        service: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
        };
    } & {
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
