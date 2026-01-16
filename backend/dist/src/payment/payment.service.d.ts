import { PrismaService } from '../prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
export declare class PaymentService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        userId: string;
        subscriptionId: string;
        amount: number;
        currency: string;
        txHash: string;
        paymentDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        userId: string;
        subscriptionId: string;
        amount: number;
        currency: string;
        txHash: string;
        paymentDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreatePaymentDto): Promise<{
        id: string;
        userId: string;
        subscriptionId: string;
        amount: number;
        currency: string;
        txHash: string;
        paymentDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdatePaymentDto): Promise<{
        id: string;
        userId: string;
        subscriptionId: string;
        amount: number;
        currency: string;
        txHash: string;
        paymentDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        userId: string;
        subscriptionId: string;
        amount: number;
        currency: string;
        txHash: string;
        paymentDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
