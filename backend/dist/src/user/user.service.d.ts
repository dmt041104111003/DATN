import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        address: string;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        address: string;
        createdAt: Date;
    }>;
    create(dto: CreateUserDto): Promise<{
        id: string;
        address: string;
        createdAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        address: string;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        address: string;
        createdAt: Date;
    }>;
}
