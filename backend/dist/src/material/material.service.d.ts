import { PrismaService } from '../prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
export declare class MaterialService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllByUser(userId: string): Promise<({
        supplier: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: string;
            location: string | null;
            gpsCoordinates: string | null;
            contactInfo: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        quantity: number;
        supplierId: string;
        harvestDate: Date | null;
    })[]>;
    findBySupplier(supplierId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        quantity: number;
        supplierId: string;
        harvestDate: Date | null;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        supplier: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: string;
            location: string | null;
            gpsCoordinates: string | null;
            contactInfo: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        quantity: number;
        supplierId: string;
        harvestDate: Date | null;
    }>;
    create(userId: string, dto: CreateMaterialDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        quantity: number;
        supplierId: string;
        harvestDate: Date | null;
    }>;
    update(id: string, userId: string, dto: UpdateMaterialDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        quantity: number;
        supplierId: string;
        harvestDate: Date | null;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        quantity: number;
        supplierId: string;
        harvestDate: Date | null;
    }>;
}
