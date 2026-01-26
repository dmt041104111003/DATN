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
exports.ProductMaterialService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const redis_service_1 = require("../redis/redis.service");
const subscription_service_1 = require("../subscription/subscription.service");
const hash_util_1 = require("../utils/hash.util");
let ProductMaterialService = class ProductMaterialService {
    prisma;
    redis;
    subscriptionService;
    constructor(prisma, redis, subscriptionService) {
        this.prisma = prisma;
        this.redis = redis;
        this.subscriptionService = subscriptionService;
    }
    async checkSubscriptionActive(userId) {
        const subscription = await this.subscriptionService.getActiveSubscription(userId);
        if (!subscription) {
            throw new common_1.BadRequestException('Subscription has expired. Please renew to continue using this feature.');
        }
        return subscription;
    }
    async findByProduct(productId, userId) {
        await this.checkProductOwnership(productId, userId);
        const cacheKey = `product-materials:product:${productId}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const materials = await this.prisma.productMaterial.findMany({
            where: { productId },
            include: {
                material: {
                    include: { supplier: true },
                },
            },
        });
        await this.redis.set(cacheKey, materials, 300);
        return materials;
    }
    async findOne(id, userId) {
        const cacheKey = `product-material:${id}`;
        const cached = await this.redis.get(cacheKey);
        if (cached && typeof cached === 'object' && 'product' in cached) {
            if (cached.product.userId !== userId)
                throw new common_1.ForbiddenException('Not your product');
            return cached;
        }
        const pm = await this.prisma.productMaterial.findUnique({
            where: { id },
            include: {
                product: true,
                material: {
                    include: { supplier: true },
                },
            },
        });
        if (!pm)
            throw new common_1.NotFoundException('ProductMaterial not found');
        if (pm.product.userId !== userId)
            throw new common_1.ForbiddenException('Not your product');
        await this.redis.set(cacheKey, pm, 300);
        return pm;
    }
    async create(userId, dto) {
        await this.checkSubscriptionActive(userId);
        if (dto.quantity <= 0) {
            throw new common_1.BadRequestException('Quantity must be greater than 0');
        }
        await this.checkProductOwnership(dto.productId, userId);
        await this.checkMaterialOwnership(dto.materialId, userId);
        const existing = await this.prisma.productMaterial.findUnique({
            where: {
                productId_materialId: {
                    productId: dto.productId,
                    materialId: dto.materialId,
                },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('This material has already been added to the product. Please update the quantity instead of adding a new entry.');
        }
        const pmHash = (0, hash_util_1.hashProductMaterial)(dto.materialId, dto.quantity, dto.unit);
        const pm = await this.prisma.productMaterial.create({
            data: {
                ...dto,
                pmHash,
            },
            include: {
                material: {
                    include: { supplier: true },
                },
            },
        });
        await this.redis.del(`product-materials:product:${dto.productId}`);
        return pm;
    }
    async update(id, userId, dto) {
        await this.checkSubscriptionActive(userId);
        if (dto.quantity !== undefined && dto.quantity <= 0) {
            throw new common_1.BadRequestException('Quantity must be greater than 0');
        }
        const pm = await this.findOneOwned(id, userId);
        const quantity = dto.quantity !== undefined ? dto.quantity : pm.quantity;
        const unit = dto.unit !== undefined ? dto.unit : pm.unit;
        const pmHash = (0, hash_util_1.hashProductMaterial)(pm.materialId, quantity, unit);
        const updated = await this.prisma.productMaterial.update({
            where: { id },
            data: {
                ...dto,
                pmHash,
            },
            include: {
                material: {
                    include: { supplier: true },
                },
            },
        });
        await this.redis.delMultiple([
            `product-material:${id}`,
            `product-materials:product:${pm.productId}`,
        ]);
        return updated;
    }
    async remove(id, userId) {
        const pm = await this.findOneOwned(id, userId);
        await this.prisma.productMaterial.delete({ where: { id } });
        await this.redis.delMultiple([
            `product-material:${id}`,
            `product-materials:product:${pm.productId}`,
        ]);
    }
    async findOneOwned(id, userId) {
        const pm = await this.prisma.productMaterial.findUnique({
            where: { id },
            include: { product: true },
        });
        if (!pm)
            throw new common_1.NotFoundException('ProductMaterial not found');
        if (pm.product.userId !== userId)
            throw new common_1.ForbiddenException('Not your product');
        return pm;
    }
    async checkProductOwnership(productId, userId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.userId !== userId)
            throw new common_1.ForbiddenException('Not your product');
    }
    async checkMaterialOwnership(materialId, userId) {
        const material = await this.prisma.material.findUnique({
            where: { id: materialId },
            include: { supplier: true },
        });
        if (!material)
            throw new common_1.NotFoundException('Material not found');
        if (material.supplier.userId !== userId)
            throw new common_1.ForbiddenException('Not your material');
    }
};
exports.ProductMaterialService = ProductMaterialService;
exports.ProductMaterialService = ProductMaterialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        subscription_service_1.SubscriptionService])
], ProductMaterialService);
//# sourceMappingURL=product-material.service.js.map