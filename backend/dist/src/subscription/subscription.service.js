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
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let SubscriptionService = class SubscriptionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllByUser(userId) {
        return this.prisma.subscription.findMany({
            where: { userId },
            include: { service: true },
        });
    }
    async findOne(id, userId) {
        const item = await this.prisma.subscription.findUnique({
            where: { id },
            include: { service: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Subscription not found');
        if (item.userId !== userId)
            throw new common_1.ForbiddenException('Not your subscription');
        return item;
    }
    async create(userId, dto) {
        const now = new Date();
        const data = {
            userId,
            servicePlanId: dto.servicePlanId,
            startDate: dto.startDate ? new Date(dto.startDate) : now,
            endDate: dto.endDate ? new Date(dto.endDate) : now,
            status: dto.status || 'pending',
        };
        return this.prisma.subscription.create({
            data,
            include: { service: true },
        });
    }
    async update(id, userId, dto) {
        await this.findOne(id, userId);
        return this.prisma.subscription.update({
            where: { id },
            data: dto,
            include: { service: true },
        });
    }
    async remove(id, userId) {
        await this.findOne(id, userId);
        return this.prisma.subscription.delete({ where: { id } });
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map