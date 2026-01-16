import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductController {
    private productService;
    constructor(productService: ProductService);
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
    findMy(user: {
        id: string;
    }): Promise<{
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
    getQuota(user: {
        id: string;
    }): Promise<{
        tier: string;
        maxProducts: number;
        usedProducts: number;
        remainingProducts: string | number;
    }>;
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
    create(user: {
        id: string;
    }, dto: CreateProductDto): Promise<{
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
    update(user: {
        id: string;
    }, id: string, dto: UpdateProductDto): Promise<{
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
    remove(user: {
        id: string;
    }, id: string): Promise<{
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
