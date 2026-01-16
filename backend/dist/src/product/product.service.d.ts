import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        userId: string;
        policyId: string | null;
        assetName: string | null;
        name: string;
        imageUrl: string | null;
        description: string | null;
        historyHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        userId: string;
        policyId: string | null;
        assetName: string | null;
        name: string;
        imageUrl: string | null;
        description: string | null;
        historyHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateProductDto): Promise<{
        id: string;
        userId: string;
        policyId: string | null;
        assetName: string | null;
        name: string;
        imageUrl: string | null;
        description: string | null;
        historyHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
        id: string;
        userId: string;
        policyId: string | null;
        assetName: string | null;
        name: string;
        imageUrl: string | null;
        description: string | null;
        historyHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        userId: string;
        policyId: string | null;
        assetName: string | null;
        name: string;
        imageUrl: string | null;
        description: string | null;
        historyHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
