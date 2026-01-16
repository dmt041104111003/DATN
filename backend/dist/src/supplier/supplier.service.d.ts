import { PrismaService } from '../prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SupplierService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllByUser(userId: string): Promise<{
        id: string;
        name: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        name: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    create(userId: string, dto: CreateSupplierDto): Promise<{
        id: string;
        name: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    update(id: string, userId: string, dto: UpdateSupplierDto): Promise<{
        id: string;
        name: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        name: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
}
