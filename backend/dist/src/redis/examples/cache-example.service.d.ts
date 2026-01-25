import { RedisService } from '../redis.service';
import { PrismaService } from '../../prisma.service';
import { Product } from '@prisma/client';
export declare class CacheExampleService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    getProductWithCache(id: string): Promise<Product | null>;
    updateProduct(id: string, data: Partial<Product>): Promise<Product>;
    getProductsListWithCache(userId?: string): Promise<Product[]>;
    clearProductCache(productId: string): Promise<void>;
    getProductFieldsWithHash(id: string): Promise<Partial<Product> | null>;
}
