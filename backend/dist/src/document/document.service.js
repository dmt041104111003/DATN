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
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const redis_service_1 = require("../redis/redis.service");
let DocumentService = class DocumentService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async findAll() {
        const cacheKey = 'documents:all';
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const documents = await this.prisma.document.findMany();
        await this.redis.set(cacheKey, documents, 300);
        return documents;
    }
    async findOne(id) {
        const cacheKey = `document:${id}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const item = await this.prisma.document.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Document not found');
        await this.redis.set(cacheKey, item, 300);
        return item;
    }
    async findOneOwned(id, userId) {
        const item = await this.prisma.document.findUnique({
            where: { id },
            include: { product: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Document not found');
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
        const document = await this.prisma.document.create({ data: dto });
        await this.redis.delMultiple([
            'documents:all',
            `documents:product:${dto.productId}`,
        ]);
        return document;
    }
    async update(id, userId, dto) {
        const document = await this.findOneOwned(id, userId);
        const updated = await this.prisma.document.update({
            where: { id },
            data: dto,
        });
        await this.redis.delMultiple([
            `document:${id}`,
            'documents:all',
            `documents:product:${document.productId}`,
        ]);
        return updated;
    }
    async remove(id, userId) {
        const document = await this.findOneOwned(id, userId);
        await this.prisma.document.delete({ where: { id } });
        await this.redis.delMultiple([
            `document:${id}`,
            'documents:all',
            `documents:product:${document.productId}`,
        ]);
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], DocumentService);
//# sourceMappingURL=document.service.js.map