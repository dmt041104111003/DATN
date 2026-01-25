import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
export declare class PaymentController {
    private paymentService;
    constructor(paymentService: PaymentService);
    findAll(user: {
        id: string;
    }): Promise<({
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
            createdAt: Date;
            updatedAt: Date;
            servicePlanId: string;
            startDate: Date;
            endDate: Date;
            status: string;
        };
    } & {
        id: string;
        userId: string;
        subscriptionId: string;
        amount: number;
        currency: string;
        txHash: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
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
            createdAt: Date;
            updatedAt: Date;
            servicePlanId: string;
            startDate: Date;
            endDate: Date;
            status: string;
        };
    } & {
        id: string;
        userId: string;
        subscriptionId: string;
        amount: number;
        currency: string;
        txHash: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(user: {
        id: string;
    }, dto: CreatePaymentDto): Promise<{
        result: boolean;
        message: string;
        data: {
            payment: {
                id: string;
                userId: string;
                subscriptionId: string;
                amount: number;
                currency: string;
                txHash: string;
                createdAt: Date;
                updatedAt: Date;
            };
            subscription: {
                id: string;
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                servicePlanId: string;
                startDate: Date;
                endDate: Date;
                status: string;
            };
        };
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdatePaymentDto): Promise<{
        id: string;
        userId: string;
        subscriptionId: string;
        amount: number;
        currency: string;
        txHash: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
        id: string;
        userId: string;
        subscriptionId: string;
        amount: number;
        currency: string;
        txHash: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
