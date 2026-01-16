import { PrismaService } from '../prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SupplierService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        location: string | null;
        userId: string;
        gpsCoordinates: string | null;
        contactInfo: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        location: string | null;
        userId: string;
        gpsCoordinates: string | null;
        contactInfo: string | null;
    }>;
    create(dto: CreateSupplierDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        location: string | null;
        userId: string;
        gpsCoordinates: string | null;
        contactInfo: string | null;
    }>;
    update(id: string, dto: UpdateSupplierDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        location: string | null;
        userId: string;
        gpsCoordinates: string | null;
        contactInfo: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        location: string | null;
        userId: string;
        gpsCoordinates: string | null;
        contactInfo: string | null;
    }>;
}
