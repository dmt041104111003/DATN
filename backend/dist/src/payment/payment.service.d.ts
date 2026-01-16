import { PrismaService } from '../prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
export declare class PaymentService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllByUser(userId: string): Promise<{
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
    findOne(id: string, userId: string): Promise<{
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
    create(userId: string, dto: CreatePaymentDto): Promise<{
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
    update(id: string, userId: string, dto: UpdatePaymentDto): Promise<{
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
    remove(id: string, userId: string): Promise<{
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
