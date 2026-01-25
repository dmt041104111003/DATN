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
exports.MetadataService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const redis_service_1 = require("../redis/redis.service");
let MetadataService = class MetadataService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async findAll() {
        const cacheKey = 'metadata:all';
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const metadata = await this.prisma.metadata.findMany();
        await this.redis.set(cacheKey, metadata, 300);
        return metadata;
    }
    async findOne(id) {
        const cacheKey = `metadata:${id}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const item = await this.prisma.metadata.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Metadata not found');
        await this.redis.set(cacheKey, item, 300);
        return item;
    }
    async findOneOwned(id, userId) {
        const item = await this.prisma.metadata.findUnique({
            where: { id },
            include: { collection: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Metadata not found');
        if (item.collection.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return item;
    }
    async create(userId, dto) {
        const collection = await this.prisma.collection.findUnique({
            where: { id: dto.collectionId },
        });
        if (!collection)
            throw new common_1.NotFoundException('Collection not found');
        if (collection.userId !== userId)
            throw new common_1.ForbiddenException('Not your collection');
        const metadata = await this.prisma.metadata.create({ data: dto });
        await this.redis.delMultiple([
            'metadata:all',
            `metadata:collection:${dto.collectionId}`,
        ]);
        return metadata;
    }
    async update(id, userId, dto) {
        const metadata = await this.findOneOwned(id, userId);
        const updated = await this.prisma.metadata.update({
            where: { id },
            data: dto,
        });
        await this.redis.delMultiple([
            `metadata:${id}`,
            'metadata:all',
            `metadata:collection:${metadata.collectionId}`,
        ]);
        return updated;
    }
    async remove(id, userId) {
        const metadata = await this.findOneOwned(id, userId);
        await this.prisma.metadata.delete({ where: { id } });
        await this.redis.delMultiple([
            `metadata:${id}`,
            'metadata:all',
            `metadata:collection:${metadata.collectionId}`,
        ]);
    }
};
exports.MetadataService = MetadataService;
exports.MetadataService = MetadataService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], MetadataService);
//# sourceMappingURL=metadata.service.js.map