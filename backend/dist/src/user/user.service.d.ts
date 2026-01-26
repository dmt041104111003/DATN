import { PrismaService } from '../prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpsertAgentDto } from './dto/upsert-agent.dto';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    private getRoleCode;
    private assertEnterprise;
    findOne(id: string): Promise<{
        id: string;
        address: string;
        walletName: string | null;
        displayName: string | null;
        location: string | null;
        gpsLatitude: number | null;
        gpsLongitude: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listAgents(enterpriseUserId: string): Promise<any>;
    upsertAgent(enterpriseUserId: string, dto: UpsertAgentDto): Promise<any>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        address: string;
        walletName: string | null;
        displayName: string | null;
        location: string | null;
        gpsLatitude: number | null;
        gpsLongitude: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        address: string;
        walletName: string | null;
        displayName: string | null;
        location: string | null;
        gpsLatitude: number | null;
        gpsLongitude: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
