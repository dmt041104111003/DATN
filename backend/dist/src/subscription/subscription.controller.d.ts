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
        txHash: string | null;
        amount: number;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        currency: string;
        paymentDate: Date;
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
                txHash: string | null;
                amount: number;
                userId: string;
                servicePlanId: string;
                startDate: Date;
                endDate: Date;
                status: import("@prisma/client").$Enums.SubscriptionStatus;
                currency: string;
                paymentDate: Date;
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
        txHash: string | null;
        amount: number;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        currency: string;
        paymentDate: Date;
    }>;
}
