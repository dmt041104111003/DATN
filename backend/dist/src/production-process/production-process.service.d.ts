import { PrismaService } from '../prisma.service';
import { CreateProductionProcessDto } from './dto/create-production-process.dto';
import { UpdateProductionProcessDto } from './dto/update-production-process.dto';
export declare class ProductionProcessService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        stepName: string;
        startTime: Date;
        endTime: Date | null;
        location: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        stepName: string;
        startTime: Date;
        endTime: Date | null;
        location: string | null;
    }>;
    create(dto: CreateProductionProcessDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        stepName: string;
        startTime: Date;
        endTime: Date | null;
        location: string | null;
    }>;
    update(id: string, dto: UpdateProductionProcessDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        stepName: string;
        startTime: Date;
        endTime: Date | null;
        location: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        stepName: string;
        startTime: Date;
        endTime: Date | null;
        location: string | null;
    }>;
}
