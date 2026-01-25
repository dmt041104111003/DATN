"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheExampleService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis.service");
const prisma_service_1 = require("../../prisma.service");
let CacheExampleService = class CacheExampleService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async getProductWithCache(id) {
        const cacheKey = `product:${id}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (product)
            await this.redis.set(cacheKey, product, 300);
        return product;
    }
    async updateProduct(id, data) {
        const product = await this.prisma.product.update({ where: { id }, data });
        await this.redis.del(`product:${id}`);
        return product;
    }
    async getProductsListWithCache(userId) {
        const cacheKey = userId ? `products:user:${userId}` : 'products:all';
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const products = await this.prisma.product.findMany({
            where: userId ? { userId } : undefined,
            take: 100,
        });
        await this.redis.set(cacheKey, products, 120);
        return products;
    }
    async clearProductCache(productId) {
        await this.redis.delMultiple([`product:${productId}`, 'products:all']);
    }
    async getProductFieldsWithHash(id) {
        const cacheKey = `product:hash:${id}`;
        const cached = await this.redis.hgetall(cacheKey);
        if (cached && Object.keys(cached).length > 0)
            return cached;
        const product = await this.prisma.product.findUnique({
            where: { id },
            select: { id: true, name: true, policyId: true, assetName: true, createdAt: true },
        });
        if (product) {
            await this.redis.hsetMultiple(cacheKey, product);
            await this.redis.expire(cacheKey, 300);
        }
        return product;
    }
};
exports.CacheExampleService = CacheExampleService;
exports.CacheExampleService = CacheExampleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], CacheExampleService);
//# sourceMappingURL=cache-example.service.js.map