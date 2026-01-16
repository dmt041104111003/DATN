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
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            servicePlanId: string;
            startDate: Date;
            endDate: Date;
            status: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        txHash: string;
        amount: number;
        userId: string;
        currency: string;
        subscriptionId: string;
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
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            servicePlanId: string;
            startDate: Date;
            endDate: Date;
            status: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        txHash: string;
        amount: number;
        userId: string;
        currency: string;
        subscriptionId: string;
    }>;
    create(user: {
        id: string;
    }, dto: CreatePaymentDto): Promise<{
        result: boolean;
        message: string;
        data: {
            payment: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                txHash: string;
                amount: number;
                userId: string;
                currency: string;
                subscriptionId: string;
            };
            subscription: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
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
        createdAt: Date;
        updatedAt: Date;
        txHash: string;
        amount: number;
        userId: string;
        currency: string;
        subscriptionId: string;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        txHash: string;
        amount: number;
        userId: string;
        currency: string;
        subscriptionId: string;
    }>;
}
