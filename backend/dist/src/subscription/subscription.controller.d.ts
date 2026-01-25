import { SubscriptionService } from './subscription.service';
import { PayDto } from './dto/pay.dto';
export declare class SubscriptionController {
    private subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    findAll(user: {
        id: string;
    }): Promise<({
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
    pay(user: {
        id: string;
    }, dto: PayDto): Promise<{
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
    cancel(user: {
        id: string;
    }, id: string): Promise<{
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
}
