import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PayDto } from './dto/pay.dto';
export declare class SubscriptionService {
    private prisma;
    private redis;
    private blockchain;
    constructor(prisma: PrismaService, redis: RedisService, blockchain: BlockchainService);
    findAllByUser(userId: string): Promise<string | ({
        service: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
        };
    } & {
        txHash: string | null;
        amount: number;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        currency: string;
        paymentDate: Date;
    })[]>;
    updateExpiredSubscriptions(userId?: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getActiveSubscription(userId: string): Promise<({
        service: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
        };
    } & {
        txHash: string | null;
        amount: number;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        currency: string;
        paymentDate: Date;
    }) | null>;
    cancel(id: string, userId: string): Promise<{
        service: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
        };
    } & {
        txHash: string | null;
        amount: number;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        currency: string;
        paymentDate: Date;
    }>;
    pay(userId: string, dto: PayDto): Promise<{
        result: boolean;
        message: string;
        data: {
            subscription: {
                service: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    price: number;
                    duration: number;
                    maxProducts: number | null;
                };
            } & {
                txHash: string | null;
                amount: number;
                id: string;
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                servicePlanId: string;
                startDate: Date;
                endDate: Date;
                status: import("@prisma/client").$Enums.SubscriptionStatus;
                currency: string;
                paymentDate: Date;
            };
        };
    }>;
    private isUpgrade;
    private verifyPaymentAsync;
}
