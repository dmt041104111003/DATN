import { PrismaService } from '../prisma.service';
export declare class ServiceService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        price: number;
        duration: number;
        maxProducts: number | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        price: number;
        duration: number;
        maxProducts: number | null;
    }>;
}
