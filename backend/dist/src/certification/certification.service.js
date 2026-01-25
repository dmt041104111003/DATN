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
let CertificationService = class CertificationService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
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
        if (item.product.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return item;
    }
    async create(userId, dto) {
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.userId !== userId)
            throw new common_1.ForbiddenException('Not your product');
        const certification = await this.prisma.certification.create({ data: dto });
        await this.redis.delMultiple([
            'certifications:all',
            `certifications:product:${dto.productId}`,
        ]);
        return certification;
    }
    async update(id, userId, dto) {
        const certification = await this.findOneOwned(id, userId);
        const updated = await this.prisma.certification.update({
            where: { id },
            data: dto,
        });
        await this.redis.delMultiple([
            `certification:${id}`,
            'certifications:all',
            `certifications:product:${certification.productId}`,
        ]);
        return updated;
    }
    async remove(id, userId) {
        const certification = await this.findOneOwned(id, userId);
        await this.prisma.certification.delete({ where: { id } });
        await this.redis.delMultiple([
            `certification:${id}`,
            'certifications:all',
            `certifications:product:${certification.productId}`,
        ]);
    }
};
exports.CertificationService = CertificationService;
exports.CertificationService = CertificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], CertificationService);
//# sourceMappingURL=certification.service.js.map