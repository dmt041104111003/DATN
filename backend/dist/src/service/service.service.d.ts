import { PrismaService } from '../prisma.service';
export declare class ServiceService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
        description: string | null;
        price: number;
        duration: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        price: number;
        duration: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
