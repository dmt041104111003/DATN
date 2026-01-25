import { PrismaService } from '../prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
export declare class PaymentService {
    private prisma;
    private blockchain;
    constructor(prisma: PrismaService, blockchain: BlockchainService);
    findAllByUser(userId: string): Promise<({
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
            servicePlanId: string;
            startDate: Date;
            endDate: Date;
            status: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        txHash: string | null;
        amount: number;
        userId: string;
        subscriptionId: string;
        currency: string;
        paymentDate: Date;
    })[]>;
    findOne(id: string, userId: string): Promise<{
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
            servicePlanId: string;
            startDate: Date;
            endDate: Date;
            status: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        txHash: string | null;
        amount: number;
        userId: string;
        subscriptionId: string;
        currency: string;
        paymentDate: Date;
    }>;
    create(userId: string, dto: CreatePaymentDto): Promise<{
        result: boolean;
        message: string;
        data: {
            payment: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                txHash: string | null;
                amount: number;
                userId: string;
                subscriptionId: string;
                currency: string;
                paymentDate: Date;
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
    update(id: string, userId: string, dto: UpdatePaymentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        txHash: string | null;
        amount: number;
        userId: string;
        subscriptionId: string;
        currency: string;
        paymentDate: Date;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        txHash: string | null;
        amount: number;
        userId: string;
        subscriptionId: string;
        currency: string;
        paymentDate: Date;
    }>;
}
