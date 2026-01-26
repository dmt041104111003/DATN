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
        startDate: Date;
        endDate: Date;
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        amount: number;
        currency: string;
        txHash: string | null;
        paymentDate: Date;
        servicePlanId: string;
    })[]>;
    updateExpiredSubscriptions(userId?: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getActiveSubscription(userId: string): Promise<({
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
        startDate: Date;
        endDate: Date;
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        amount: number;
        currency: string;
        txHash: string | null;
        paymentDate: Date;
        servicePlanId: string;
    }) | null>;
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
        startDate: Date;
        endDate: Date;
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        amount: number;
        currency: string;
        txHash: string | null;
        paymentDate: Date;
        servicePlanId: string;
    }>;
    pay(userId: string, dto: PayDto): Promise<{
        result: boolean;
        message: string;
        data: {
            subscription: {
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
                startDate: Date;
                endDate: Date;
                status: import("@prisma/client").$Enums.SubscriptionStatus;
                amount: number;
                currency: string;
                txHash: string | null;
                paymentDate: Date;
                servicePlanId: string;
            };
        };
    }>;
    private isUpgrade;
    private verifyPaymentAsync;
}
