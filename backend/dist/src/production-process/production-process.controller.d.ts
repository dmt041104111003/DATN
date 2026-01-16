import { ProductionProcessService } from './production-process.service';
import { CreateProductionProcessDto } from './dto/create-production-process.dto';
import { UpdateProductionProcessDto } from './dto/update-production-process.dto';
export declare class ProductionProcessController {
    private productionProcessService;
    constructor(productionProcessService: ProductionProcessService);
    findAll(): Promise<{
        id: string;
        productId: string;
        stepName: string;
        startTime: Date;
        endTime: Date | null;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        productId: string;
        stepName: string;
        startTime: Date;
        endTime: Date | null;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateProductionProcessDto): Promise<{
        id: string;
        productId: string;
        stepName: string;
        startTime: Date;
        endTime: Date | null;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateProductionProcessDto): Promise<{
        id: string;
        productId: string;
        stepName: string;
        startTime: Date;
        endTime: Date | null;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        productId: string;
        stepName: string;
        startTime: Date;
        endTime: Date | null;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
