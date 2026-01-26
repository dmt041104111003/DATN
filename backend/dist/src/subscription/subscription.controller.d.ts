import { SubscriptionService } from './subscription.service';
import { PayDto } from './dto/pay.dto';
export declare class SubscriptionController {
    private subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    findAll(user: {
        id: string;
    }): Promise<string | ({
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
    pay(user: {
        id: string;
    }, dto: PayDto): Promise<{
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
    cancel(user: {
        id: string;
    }, id: string): Promise<{
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
}
