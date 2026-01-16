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
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
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
        txHash: string;
        amount: number;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        subscriptionId: string;
        currency: string;
    })[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
        subscription: {
            service: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
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
        txHash: string;
        amount: number;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        subscriptionId: string;
        currency: string;
    }>;
    create(user: {
        id: string;
    }, dto: CreatePaymentDto): Promise<{
        result: boolean;
        message: string;
        data: {
            payment: {
                txHash: string;
                amount: number;
                id: string;
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                subscriptionId: string;
                currency: string;
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
        txHash: string;
        amount: number;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        subscriptionId: string;
        currency: string;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
        txHash: string;
        amount: number;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        subscriptionId: string;
        currency: string;
    }>;
}
