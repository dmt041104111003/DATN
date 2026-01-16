import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        name: string;
        description: string | null;
        imageUrl: string | null;
        id: string;
        userId: string;
        policyId: string | null;
        assetName: string | null;
        historyHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findAllByUser(userId: string): Promise<{
        name: string;
        description: string | null;
        imageUrl: string | null;
        id: string;
        userId: string;
        policyId: string | null;
        assetName: string | null;
        historyHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        description: string | null;
        imageUrl: string | null;
        id: string;
        userId: string;
        policyId: string | null;
        assetName: string | null;
        historyHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private findOneOwned;
    create(userId: string, dto: CreateProductDto): Promise<{
        name: string;
        description: string | null;
        imageUrl: string | null;
        id: string;
        userId: string;
        policyId: string | null;
        assetName: string | null;
        historyHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, userId: string, dto: UpdateProductDto): Promise<{
        name: string;
        description: string | null;
        imageUrl: string | null;
        id: string;
        userId: string;
        policyId: string | null;
        assetName: string | null;
        historyHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<{
        name: string;
        description: string | null;
        imageUrl: string | null;
        id: string;
        userId: string;
        policyId: string | null;
        assetName: string | null;
        historyHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
