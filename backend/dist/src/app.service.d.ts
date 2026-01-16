import { PrismaService } from './prisma.service';
export declare class AppService {
    private prisma;
    constructor(prisma: PrismaService);
    getUsers(): Promise<{
        id: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
