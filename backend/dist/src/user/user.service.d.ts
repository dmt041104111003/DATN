import { PrismaService } from '../prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        walletName: string | null;
        displayName: string | null;
        location: string | null;
        gpsLatitude: number | null;
        gpsLongitude: number | null;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        walletName: string | null;
        displayName: string | null;
        location: string | null;
        gpsLatitude: number | null;
        gpsLongitude: number | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        walletName: string | null;
        displayName: string | null;
        location: string | null;
        gpsLatitude: number | null;
        gpsLongitude: number | null;
    }>;
}
