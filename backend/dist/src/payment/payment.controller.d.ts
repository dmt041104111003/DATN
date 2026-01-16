import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
export declare class PaymentController {
    private paymentService;
    constructor(paymentService: PaymentService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subscriptionId: string;
        amount: number;
        currency: string;
        txHash: string;
        paymentDate: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subscriptionId: string;
        amount: number;
        currency: string;
        txHash: string;
        paymentDate: Date;
    }>;
    create(dto: CreatePaymentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subscriptionId: string;
        amount: number;
        currency: string;
        txHash: string;
        paymentDate: Date;
    }>;
    update(id: string, dto: UpdatePaymentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subscriptionId: string;
        amount: number;
        currency: string;
        txHash: string;
        paymentDate: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subscriptionId: string;
        amount: number;
        currency: string;
        txHash: string;
        paymentDate: Date;
    }>;
}
