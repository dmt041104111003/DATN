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
exports.CertificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const redis_service_1 = require("../redis/redis.service");
const subscription_service_1 = require("../subscription/subscription.service");
const hash_util_1 = require("../utils/hash.util");
let CertificationService = class CertificationService {
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
    async findAll() {
        const cacheKey = 'certifications:all';
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const certifications = await this.prisma.certification.findMany();
        await this.redis.set(cacheKey, certifications, 300);
        return certifications;
    }
    async findOne(id) {
        const cacheKey = `certification:${id}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const item = await this.prisma.certification.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Certification not found');
        await this.redis.set(cacheKey, item, 300);
        return item;
    }
    async findOneOwned(id, userId) {
        const item = await this.prisma.certification.findUnique({
            where: { id },
            include: { product: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Certification not found');
        if (item.product && item.product.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return item;
    }
    async create(userId, dto) {
        await this.checkSubscriptionActive(userId);
        if (dto.expiryDate && new Date(dto.expiryDate) <= new Date(dto.issueDate)) {
            throw new common_1.BadRequestException('Expiry date must be after issue date');
        }
        if (dto.productId) {
            const product = await this.prisma.product.findUnique({
                where: { id: dto.productId },
            });
            if (!product)
                throw new common_1.NotFoundException('Product not found');
            if (product.userId !== userId)
                throw new common_1.ForbiddenException('Not your product');
        }
        const certHash = (0, hash_util_1.hashCertification)(dto.certName, dto.issueDate, dto.expiryDate);
        const createData = {
            certName: dto.certName,
            certHash,
            issueDate: new Date(dto.issueDate),
            expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        };
        if (dto.productId) {
            createData.productId = dto.productId;
        }
        const certification = await this.prisma.certification.create({
            data: createData,
        });
        const cacheKeys = ['certifications:all'];
        if (dto.productId) {
            cacheKeys.push(`certifications:product:${dto.productId}`);
        }
        await this.redis.delMultiple(cacheKeys);
        return certification;
    }
    async update(id, userId, dto) {
        await this.checkSubscriptionActive(userId);
        const certification = await this.findOneOwned(id, userId);
        if (dto.productId !== undefined) {
            if (dto.productId) {
                const product = await this.prisma.product.findUnique({
                    where: { id: dto.productId },
                });
                if (!product)
                    throw new common_1.NotFoundException('Product not found');
                if (product.userId !== userId)
                    throw new common_1.ForbiddenException('Not your product');
            }
        }
        const issueDate = dto.issueDate ? new Date(dto.issueDate) : certification.issueDate;
        const expiryDate = dto.expiryDate !== undefined ? (dto.expiryDate ? new Date(dto.expiryDate) : null) : certification.expiryDate;
        if (expiryDate && expiryDate <= issueDate) {
            throw new common_1.BadRequestException('Expiry date must be after issue date');
        }
        const certName = dto.certName || certification.certName;
        const certHash = (0, hash_util_1.hashCertification)(certName, issueDate, expiryDate);
        const updateData = {
            certHash,
            issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
            expiryDate: dto.expiryDate !== undefined ? (dto.expiryDate ? new Date(dto.expiryDate) : null) : undefined,
        };
        if (dto.productId !== undefined) {
            updateData.productId = dto.productId || null;
        }
        if (dto.certName !== undefined) {
            updateData.certName = dto.certName;
        }
        const updated = await this.prisma.certification.update({
            where: { id },
            data: updateData,
        });
        const cacheKeys = [`certification:${id}`, 'certifications:all'];
        if (certification.productId) {
            cacheKeys.push(`certifications:product:${certification.productId}`);
        }
        if (dto.productId && dto.productId !== certification.productId) {
            cacheKeys.push(`certifications:product:${dto.productId}`);
        }
        await this.redis.delMultiple(cacheKeys);
        return updated;
    }
    async remove(id, userId) {
        const certification = await this.findOneOwned(id, userId);
        await this.prisma.certification.delete({ where: { id } });
        const cacheKeys = [`certification:${id}`, 'certifications:all'];
        if (certification.productId) {
            cacheKeys.push(`certifications:product:${certification.productId}`);
        }
        await this.redis.delMultiple(cacheKeys);
    }
};
exports.CertificationService = CertificationService;
exports.CertificationService = CertificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        subscription_service_1.SubscriptionService])
], CertificationService);
//# sourceMappingURL=certification.service.js.map