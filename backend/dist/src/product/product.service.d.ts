import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        assetName: string | null;
        userId: string;
        policyId: string | null;
        historyHash: string | null;
    }[]>;
    findAllByUser(userId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        assetName: string | null;
        userId: string;
        policyId: string | null;
        historyHash: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        assetName: string | null;
        userId: string;
        policyId: string | null;
        historyHash: string | null;
    }>;
    private findOneOwned;
    create(userId: string, dto: CreateProductDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        assetName: string | null;
        userId: string;
        policyId: string | null;
        historyHash: string | null;
    }>;
    update(id: string, userId: string, dto: UpdateProductDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        assetName: string | null;
        userId: string;
        policyId: string | null;
        historyHash: string | null;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        assetName: string | null;
        userId: string;
        policyId: string | null;
        historyHash: string | null;
    }>;
}
