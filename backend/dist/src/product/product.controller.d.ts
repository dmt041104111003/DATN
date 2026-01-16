import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductController {
    private productService;
    constructor(productService: ProductService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        userId: string;
        assetName: string | null;
        imageUrl: string | null;
        policyId: string | null;
        historyHash: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        userId: string;
        assetName: string | null;
        imageUrl: string | null;
        policyId: string | null;
        historyHash: string | null;
    }>;
    create(dto: CreateProductDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        userId: string;
        assetName: string | null;
        imageUrl: string | null;
        policyId: string | null;
        historyHash: string | null;
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        userId: string;
        assetName: string | null;
        imageUrl: string | null;
        policyId: string | null;
        historyHash: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        userId: string;
        assetName: string | null;
        imageUrl: string | null;
        policyId: string | null;
        historyHash: string | null;
    }>;
}
