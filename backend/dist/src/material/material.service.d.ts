import { PrismaService } from '../prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
export declare class MaterialService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllByUser(userId: string): Promise<({
        supplier: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            gpsCoordinates: string | null;
            contactInfo: string | null;
            userId: string;
        };
    } & {
        id: string;
        supplierId: string;
        name: string;
        harvestDate: Date | null;
        quantity: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findBySupplier(supplierId: string, userId: string): Promise<{
        id: string;
        supplierId: string;
        name: string;
        harvestDate: Date | null;
        quantity: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        supplier: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            gpsCoordinates: string | null;
            contactInfo: string | null;
            userId: string;
        };
    } & {
        id: string;
        supplierId: string;
        name: string;
        harvestDate: Date | null;
        quantity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(userId: string, dto: CreateMaterialDto): Promise<{
        id: string;
        supplierId: string;
        name: string;
        harvestDate: Date | null;
        quantity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, userId: string, dto: UpdateMaterialDto): Promise<{
        id: string;
        supplierId: string;
        name: string;
        harvestDate: Date | null;
        quantity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        supplierId: string;
        name: string;
        harvestDate: Date | null;
        quantity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
