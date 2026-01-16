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
let ProductService = class ProductService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductService);
//# sourceMappingURL=product.service.js.map