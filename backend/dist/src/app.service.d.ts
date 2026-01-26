import { PrismaService } from './prisma.service';
export declare class AppService {
    private prisma;
    constructor(prisma: PrismaService);
    getUsers(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        walletName: string | null;
        displayName: string | null;
        location: string | null;
        gpsLatitude: number | null;
        gpsLongitude: number | null;
    }[]>;
}
