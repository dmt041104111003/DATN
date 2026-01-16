import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductController {
    private productService;
    constructor(productService: ProductService);
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
    findMy(user: {
        id: string;
    }): Promise<{
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
    create(user: {
        id: string;
    }, dto: CreateProductDto): Promise<{
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
    update(user: {
        id: string;
    }, id: string, dto: UpdateProductDto): Promise<{
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
    remove(user: {
        id: string;
    }, id: string): Promise<{
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
