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
const blockchain_service_1 = require("../blockchain/blockchain.service");
let ProductService = class ProductService {
    prisma;
    blockchain;
    constructor(prisma, blockchain) {
        this.prisma = prisma;
        this.blockchain = blockchain;
    }
    async findAll() {
        return this.prisma.product.findMany();
    }
    async findAllByUser(userId) {
        return this.prisma.product.findMany({ where: { userId } });
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async findOneOwned(id, userId) {
        const product = await this.findOne(id);
        if (product.userId !== userId)
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
        const currentCount = await this.prisma.product.count({ where: { userId } });
        if (currentCount >= maxProducts) {
            const tierName = subscription?.service.name ?? 'Free';
            throw new common_1.ForbiddenException(`Bạn đã đạt giới hạn ${maxProducts} sản phẩm của gói ${tierName}. Nâng cấp gói để tạo thêm.`);
        }
    }
    async create(userId, dto) {
        await this.checkProductLimit(userId);
        return this.prisma.product.create({
            data: { ...dto, userId },
        });
    }
    async update(id, userId, dto) {
        await this.findOneOwned(id, userId);
        return this.prisma.product.update({ where: { id }, data: dto });
    }
    async remove(id, userId) {
        await this.findOneOwned(id, userId);
        return this.prisma.product.delete({ where: { id } });
    }
    async getQuota(userId) {
        const subscription = await this.getActiveSubscription(userId);
        const maxProducts = subscription?.service.maxProducts ?? 5;
        const currentCount = await this.prisma.product.count({ where: { userId } });
        return {
            tier: subscription?.service.name ?? 'Free',
            maxProducts: maxProducts,
            usedProducts: currentCount,
            remainingProducts: maxProducts === null ? 'unlimited' : maxProducts - currentCount,
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
                    description: product.description,
                    imageUrl: product.imageUrl,
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
        blockchain_service_1.BlockchainService])
], ProductService);
//# sourceMappingURL=product.service.js.map