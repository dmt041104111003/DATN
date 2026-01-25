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
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const redis_service_1 = require("../redis/redis.service");
const blockchain_service_1 = require("../blockchain/blockchain.service");
const subscription_service_1 = require("../subscription/subscription.service");
let ProductService = class ProductService {
    prisma;
    redis;
    blockchain;
    subscriptionService;
    constructor(prisma, redis, blockchain, subscriptionService) {
        this.prisma = prisma;
        this.redis = redis;
        this.blockchain = blockchain;
        this.subscriptionService = subscriptionService;
    }
    async checkSubscriptionActive(userId) {
        const subscription = await this.subscriptionService.getActiveSubscription(userId);
        if (!subscription) {
            throw new common_1.BadRequestException('Subscription has expired. Please renew to continue using this feature.');
        }
        return subscription;
    }
    async findAll() {
        const cacheKey = 'products:all';
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const products = await this.prisma.product.findMany();
        await this.redis.set(cacheKey, products, 300);
        return products;
    }
    async findAllByUser(userId) {
        const cacheKey = `products:user:${userId}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const products = await this.prisma.product.findMany({ where: { userId } });
        await this.redis.set(cacheKey, products, 300);
        return products;
    }
    async findOne(id) {
        const cacheKey = `product:${id}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        await this.redis.set(cacheKey, product, 300);
        return product;
    }
    async findOneOwned(id, userId) {
        const product = await this.findOne(id);
        if (!product || typeof product === 'string' || product.userId !== userId)
            throw new common_1.ForbiddenException('Not your product');
        return product;
    }
    async getActiveSubscription(userId) {
        const now = new Date();
        return this.prisma.subscription.findFirst({
            where: {
                userId,
                status: 'active',
                startDate: { lte: now },
                endDate: { gte: now },
            },
            include: { service: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async checkProductLimit(userId) {
        const subscription = await this.getActiveSubscription(userId);
        const maxProducts = subscription?.service.maxProducts ?? 5;
        if (maxProducts === null)
            return;
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayCount = await this.prisma.product.count({
            where: {
                userId,
                createdAt: { gte: startOfDay },
            },
        });
        if (todayCount >= maxProducts) {
            const tierName = subscription?.service.name ?? 'Free';
            throw new common_1.ForbiddenException(`You have reached the daily limit of ${maxProducts} products for the ${tierName} plan. Upgrade your plan to create more.`);
        }
    }
    async create(userId, dto) {
        await this.checkSubscriptionActive(userId);
        await this.checkProductLimit(userId);
        const product = await this.prisma.product.create({
            data: { ...dto, userId },
        });
        await this.redis.delMultiple(['products:all', `products:user:${userId}`]);
        return product;
    }
    async update(id, userId, dto) {
        await this.checkSubscriptionActive(userId);
        await this.findOneOwned(id, userId);
        const product = await this.prisma.product.update({
            where: { id },
            data: dto,
        });
        await this.redis.delMultiple([
            `product:${id}`,
            'products:all',
            `products:user:${userId}`,
        ]);
        return product;
    }
    async remove(id, userId) {
        await this.checkSubscriptionActive(userId);
        const product = await this.findOneOwned(id, userId);
        const isMinted = product.policyId && product.assetName;
        await this.prisma.product.delete({ where: { id } });
        await this.redis.delMultiple([
            `product:${id}`,
            'products:all',
            `products:user:${userId}`,
        ]);
        return {
            success: true,
            message: 'Product deleted successfully',
            wasMinted: isMinted,
            warning: isMinted
                ? 'Note: This product was minted as NFT. On-chain blockchain data cannot be deleted, but off-chain metadata has been removed.'
                : null,
        };
    }
    async getQuota(userId) {
        const subscription = await this.getActiveSubscription(userId);
        const maxProducts = subscription?.service.maxProducts ?? 5;
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayCount = await this.prisma.product.count({
            where: {
                userId,
                createdAt: { gte: startOfDay },
            },
        });
        return {
            tier: subscription?.service.name ?? 'Free',
            maxProducts: maxProducts,
            usedProducts: todayCount,
            remainingProducts: maxProducts === null ? 'unlimited' : maxProducts - todayCount,
        };
    }
    async traceByNft(policyId, assetName) {
        const assetNameHex = this.toHex(assetName);
        const product = await this.prisma.product.findFirst({
            where: { policyId, assetName },
            include: {
                documents: true,
                productionProcesses: true,
                certifications: true,
                warehouseStorages: {
                    include: { warehouse: true },
                },
                productMaterials: {
                    include: {
                        material: {
                            include: {
                                supplier: true,
                            },
                        },
                    },
                },
                user: {
                    select: { id: true, address: true },
                },
            },
        });
        let assetInfo = null;
        let onChainMetadata = null;
        try {
            [assetInfo, onChainMetadata] = await Promise.all([
                this.blockchain.getAssetInfo(policyId, assetNameHex),
                this.blockchain.getAssetMetadata(policyId, assetNameHex),
            ]);
        }
        catch { }
        if (!product && !assetInfo) {
            throw new common_1.NotFoundException('Product not found');
        }
        return {
            product: product
                ? {
                    id: product.id,
                    name: product.name,
                    policyId: product.policyId,
                    assetName: product.assetName,
                    historyHash: product.historyHash,
                    documents: product.documents,
                    productionProcesses: product.productionProcesses,
                    certifications: product.certifications,
                    warehouseStorages: product.warehouseStorages,
                    materials: product.productMaterials.map((pm) => ({
                        name: pm.material.name,
                        quantity: pm.quantity,
                        unit: pm.unit,
                        harvestDate: pm.material.harvestDate,
                        supplier: {
                            name: pm.material.supplier.name,
                            location: pm.material.supplier.location,
                        },
                    })),
                    owner: product.user.address,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt,
                }
                : null,
            blockchain: {
                policyId,
                assetName,
                assetInfo,
                onChainMetadata,
            },
        };
    }
    async getHistory(productId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (!product.policyId || !product.assetName) {
            return {
                product: { id: product.id, name: product.name },
                history: [],
                message: 'Product has not been minted as NFT yet',
            };
        }
        const assetNameHex = this.toHex(product.assetName);
        const history = await this.blockchain.getAssetHistory(product.policyId, assetNameHex);
        return {
            product: {
                id: product.id,
                name: product.name,
                policyId: product.policyId,
                assetName: product.assetName,
            },
            history,
        };
    }
    toHex(str) {
        if (/^[0-9a-fA-F]+$/.test(str)) {
            return str;
        }
        return Buffer.from(str, 'utf8').toString('hex');
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        blockchain_service_1.BlockchainService,
        subscription_service_1.SubscriptionService])
], ProductService);
//# sourceMappingURL=product.service.js.map