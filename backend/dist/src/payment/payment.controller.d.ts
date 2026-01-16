import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
export declare class PaymentController {
    private paymentService;
    constructor(paymentService: PaymentService);
    findAll(user: {
        id: string;
    }): Promise<{
        subscriptionId: string;
        amount: number;
        currency: string;
        txHash: string;
        paymentDate: Date;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
        subscriptionId: string;
        amount: number;
        currency: string;
        txHash: string;
        paymentDate: Date;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(user: {
        id: string;
    }, dto: CreatePaymentDto): Promise<{
        subscriptionId: string;
        amount: number;
        currency: string;
        txHash: string;
        paymentDate: Date;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdatePaymentDto): Promise<{
        subscriptionId: string;
        amount: number;
        currency: string;
        txHash: string;
        paymentDate: Date;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
        subscriptionId: string;
        amount: number;
        currency: string;
        txHash: string;
        paymentDate: Date;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
