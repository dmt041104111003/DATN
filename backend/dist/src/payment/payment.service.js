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
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let PaymentService = class PaymentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllByUser(userId) {
        return this.prisma.payment.findMany({ where: { userId } });
    }
    async findOne(id, userId) {
        const item = await this.prisma.payment.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Payment not found');
        if (item.userId !== userId)
            throw new common_1.ForbiddenException('Not your payment');
        return item;
    }
    async create(userId, dto) {
        return this.prisma.payment.create({
            data: { ...dto, userId },
        });
    }
    async update(id, userId, dto) {
        await this.findOne(id, userId);
        return this.prisma.payment.update({ where: { id }, data: dto });
    }
    async remove(id, userId) {
        await this.findOne(id, userId);
        return this.prisma.payment.delete({ where: { id } });
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map