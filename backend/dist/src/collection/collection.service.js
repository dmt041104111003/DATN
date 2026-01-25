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
exports.CollectionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const redis_service_1 = require("../redis/redis.service");
let CollectionService = class CollectionService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async findAll() {
        const cacheKey = 'collections:all';
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const collections = await this.prisma.collection.findMany();
        await this.redis.set(cacheKey, collections, 300);
        return collections;
    }
    async findAllByUser(userId) {
        const cacheKey = `collections:user:${userId}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const collections = await this.prisma.collection.findMany({
            where: { userId },
        });
        await this.redis.set(cacheKey, collections, 300);
        return collections;
    }
    async findOne(id) {
        const cacheKey = `collection:${id}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const item = await this.prisma.collection.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Collection not found');
        await this.redis.set(cacheKey, item, 300);
        return item;
    }
    async findOneOwned(id, userId) {
        const item = await this.findOne(id);
        if (!item || typeof item === 'string' || item.userId !== userId)
            throw new common_1.ForbiddenException('Not your collection');
        return item;
    }
    async create(userId, dto) {
        const collection = await this.prisma.collection.create({
            data: { ...dto, userId },
        });
        await this.redis.delMultiple([
            'collections:all',
            `collections:user:${userId}`,
        ]);
        return collection;
    }
    async update(id, userId, dto) {
        await this.findOneOwned(id, userId);
        const collection = await this.prisma.collection.update({
            where: { id },
            data: dto,
        });
        await this.redis.delMultiple([
            `collection:${id}`,
            'collections:all',
            `collections:user:${userId}`,
        ]);
        return collection;
    }
    async remove(id, userId) {
        await this.findOneOwned(id, userId);
        await this.prisma.collection.delete({ where: { id } });
        await this.redis.delMultiple([
            `collection:${id}`,
            'collections:all',
            `collections:user:${userId}`,
        ]);
    }
};
exports.CollectionService = CollectionService;
exports.CollectionService = CollectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], CollectionService);
//# sourceMappingURL=collection.service.js.map