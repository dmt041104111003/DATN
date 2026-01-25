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
let WarehouseService = class WarehouseService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async findAll() {
        const cacheKey = 'warehouses:all';
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const warehouses = await this.prisma.warehouse.findMany();
        await this.redis.set(cacheKey, warehouses, 300);
        return warehouses;
    }
    async findOne(id) {
        const cacheKey = `warehouse:${id}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const item = await this.prisma.warehouse.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Warehouse not found');
        await this.redis.set(cacheKey, item, 300);
        return item;
    }
    async create(dto) {
        const warehouse = await this.prisma.warehouse.create({
            data: {
                name: dto.name,
                location: dto.location,
                capacity: dto.capacity ?? 0,
            },
        });
        await this.redis.del('warehouses:all');
        return warehouse;
    }
    async update(id, dto) {
        await this.findOne(id);
        const warehouse = await this.prisma.warehouse.update({
            where: { id },
            data: dto,
        });
        await this.redis.delMultiple([`warehouse:${id}`, 'warehouses:all']);
        return warehouse;
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.warehouse.delete({ where: { id } });
        await this.redis.delMultiple([`warehouse:${id}`, 'warehouses:all']);
    }
};
exports.WarehouseService = WarehouseService;
exports.WarehouseService = WarehouseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], WarehouseService);
//# sourceMappingURL=warehouse.service.js.map