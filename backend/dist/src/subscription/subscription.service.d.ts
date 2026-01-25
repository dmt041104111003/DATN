import { PrismaService } from '../prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PayDto } from './dto/pay.dto';
export declare class SubscriptionService {
    private prisma;
    private blockchain;
    constructor(prisma: PrismaService, blockchain: BlockchainService);
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
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        amount: number;
        currency: string;
        txHash: string | null;
        paymentDate: Date;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    updateExpiredSubscriptions(userId?: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getActiveSubscription(userId: string): Promise<({
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
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        amount: number;
        currency: string;
        txHash: string | null;
        paymentDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
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
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        amount: number;
        currency: string;
        txHash: string | null;
        paymentDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    pay(userId: string, dto: PayDto): Promise<{
        result: boolean;
        message: string;
        data: {
            subscription: {
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
                status: import("@prisma/client").$Enums.SubscriptionStatus;
                amount: number;
                currency: string;
                txHash: string | null;
                paymentDate: Date;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    private isUpgrade;
    private verifyPaymentAsync;
}
