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
    findOne(id: string, userId: string): Promise<{
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
    create(userId: string, dto: CreatePaymentDto): Promise<{
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
    update(id: string, userId: string, dto: UpdatePaymentDto): Promise<{
        txHash: string;
        amount: number;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        subscriptionId: string;
        currency: string;
    }>;
    remove(id: string, userId: string): Promise<{
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
