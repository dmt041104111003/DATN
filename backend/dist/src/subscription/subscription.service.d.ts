import { PrismaService } from '../prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
export declare class SubscriptionService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllByUser(userId: string): Promise<({
        service: {
            id: string;
            name: string;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    })[]>;
    findOne(id: string, userId: string): Promise<{
        service: {
            id: string;
            name: string;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    }>;
    create(userId: string, dto: CreateSubscriptionDto): Promise<{
        service: {
            id: string;
            name: string;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    }>;
    update(id: string, userId: string, dto: UpdateSubscriptionDto): Promise<{
        service: {
            id: string;
            name: string;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    }>;
    cancel(id: string, userId: string): Promise<{
        service: {
            id: string;
            name: string;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    }>;
}
