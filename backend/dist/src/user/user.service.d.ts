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
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        walletName: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        walletName: string | null;
    }>;
}
