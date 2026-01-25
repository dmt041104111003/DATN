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
exports.SupplierService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const redis_service_1 = require("../redis/redis.service");
let SupplierService = class SupplierService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async findAllByUser(userId) {
        const cacheKey = `suppliers:user:${userId}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const suppliers = await this.prisma.supplier.findMany({
            where: { userId },
        });
        await this.redis.set(cacheKey, suppliers, 300);
        return suppliers;
    }
    async findOne(id, userId) {
        const cacheKey = `supplier:${id}`;
        const cached = await this.redis.get(cacheKey);
        if (cached && typeof cached === 'object') {
            if (cached.userId !== userId)
                throw new common_1.ForbiddenException('Not your supplier');
            return cached;
        }
        const supplier = await this.prisma.supplier.findUnique({ where: { id } });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        if (supplier.userId !== userId)
            throw new common_1.ForbiddenException('Not your supplier');
        await this.redis.set(cacheKey, supplier, 300);
        return supplier;
    }
    async create(userId, dto) {
        const supplier = await this.prisma.supplier.create({
            data: { ...dto, userId },
        });
        await this.redis.del(`suppliers:user:${userId}`);
        return supplier;
    }
    async update(id, userId, dto) {
        await this.findOne(id, userId);
        const supplier = await this.prisma.supplier.update({
            where: { id },
            data: dto,
        });
        await this.redis.delMultiple([
            `supplier:${id}`,
            `suppliers:user:${userId}`,
        ]);
        return supplier;
    }
    async remove(id, userId) {
        await this.findOne(id, userId);
        await this.prisma.supplier.delete({ where: { id } });
        await this.redis.delMultiple([
            `supplier:${id}`,
            `suppliers:user:${userId}`,
        ]);
    }
};
exports.SupplierService = SupplierService;
exports.SupplierService = SupplierService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], SupplierService);
//# sourceMappingURL=supplier.service.js.map