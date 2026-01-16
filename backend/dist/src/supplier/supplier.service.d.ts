import { PrismaService } from '../prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SupplierService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllByUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
    }>;
    create(userId: string, dto: CreateSupplierDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
    }>;
    update(id: string, userId: string, dto: UpdateSupplierDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
    }>;
}
