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
exports.WarehouseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const redis_service_1 = require("../redis/redis.service");
const subscription_service_1 = require("../subscription/subscription.service");
let WarehouseService = class WarehouseService {
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
    async findAll(userId) {
        const cacheKey = `warehouses:user:${userId}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const warehouses = await this.prisma.warehouse.findMany({
            where: { userId },
        });
        await this.redis.set(cacheKey, warehouses, 300);
        return warehouses;
    }
    async findOne(id, userId) {
        const cacheKey = `warehouse:${id}`;
        const cached = await this.redis.get(cacheKey);
        if (cached && typeof cached === 'object' && 'userId' in cached) {
            if (cached.userId !== userId)
                throw new common_1.ForbiddenException('Not your warehouse');
            return cached;
        }
        const item = await this.prisma.warehouse.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Warehouse not found');
        if (item.userId !== userId)
            throw new common_1.ForbiddenException('Not your warehouse');
        await this.redis.set(cacheKey, item, 300);
        return item;
    }
    async create(userId, dto) {
        await this.checkSubscriptionActive(userId);
        if (dto.capacity !== undefined && dto.capacity < 0) {
            throw new common_1.BadRequestException('Warehouse capacity must be greater than or equal to 0');
        }
        const warehouse = await this.prisma.warehouse.create({
            data: {
                name: dto.name,
                location: dto.location,
                capacity: dto.capacity ?? 0,
                userId,
            },
        });
        await this.redis.del(`warehouses:user:${userId}`);
        return warehouse;
    }
    async update(id, userId, dto) {
        await this.checkSubscriptionActive(userId);
        if (dto.capacity !== undefined && dto.capacity < 0) {
            throw new common_1.BadRequestException('Warehouse capacity must be greater than or equal to 0');
        }
        await this.findOne(id, userId);
        const warehouse = await this.prisma.warehouse.update({
            where: { id },
            data: dto,
        });
        await this.redis.delMultiple([`warehouse:${id}`, `warehouses:user:${userId}`]);
        return warehouse;
    }
    async remove(id, userId) {
        await this.findOne(id, userId);
        await this.prisma.warehouse.delete({ where: { id } });
        await this.redis.delMultiple([`warehouse:${id}`, `warehouses:user:${userId}`]);
    }
};
exports.WarehouseService = WarehouseService;
exports.WarehouseService = WarehouseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        subscription_service_1.SubscriptionService])
], WarehouseService);
//# sourceMappingURL=warehouse.service.js.map