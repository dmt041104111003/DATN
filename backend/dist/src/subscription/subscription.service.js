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
const blockchain_service_1 = require("../blockchain/blockchain.service");
const subscription_constants_1 = require("./subscription.constants");
let SubscriptionService = class SubscriptionService {
    prisma;
    blockchain;
    constructor(prisma, blockchain) {
        this.prisma = prisma;
        this.blockchain = blockchain;
    }
    async findAllByUser(userId) {
        await this.updateExpiredSubscriptions(userId);
        return this.prisma.subscription.findMany({
            where: { userId },
            include: { service: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateExpiredSubscriptions(userId) {
        const now = new Date();
        const where = userId
            ? {
                userId,
                status: subscription_constants_1.SUBSCRIPTION_STATUS.ACTIVE,
                endDate: { lt: now },
            }
            : {
                status: subscription_constants_1.SUBSCRIPTION_STATUS.ACTIVE,
                endDate: { lt: now },
            };
        return this.prisma.subscription.updateMany({
            where,
            data: { status: subscription_constants_1.SUBSCRIPTION_STATUS.EXPIRED },
        });
    }
    async getActiveSubscription(userId) {
        await this.updateExpiredSubscriptions(userId);
        return this.prisma.subscription.findFirst({
            where: {
                userId,
                status: subscription_constants_1.SUBSCRIPTION_STATUS.ACTIVE,
            },
            include: { service: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async cancel(id, userId) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { id },
        });
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        if (subscription.userId !== userId) {
            throw new common_1.ForbiddenException('Not your subscription');
        }
        return this.prisma.subscription.update({
            where: { id },
            data: { status: subscription_constants_1.SUBSCRIPTION_STATUS.CANCELLED },
            include: { service: true },
        });
    }
    async pay(userId, dto) {
        const existingSubscription = await this.prisma.subscription.findFirst({
            where: { txHash: dto.txHash },
        });
        if (existingSubscription) {
            throw new common_1.BadRequestException('Transaction hash already used');
        }
        const service = await this.prisma.service.findUnique({
            where: { id: dto.servicePlanId },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        await this.updateExpiredSubscriptions(userId);
        const activeSubscription = await this.getActiveSubscription(userId);
        if (activeSubscription) {
            await this.prisma.subscription.update({
                where: { id: activeSubscription.id },
                data: { status: subscription_constants_1.SUBSCRIPTION_STATUS.CANCELLED },
            });
        }
        const verification = await this.blockchain.verifyPayment(dto.txHash, service.price);
        if (!verification.valid) {
            throw new common_1.BadRequestException(verification.message);
        }
        if (!verification.confirmedAmount) {
            throw new common_1.BadRequestException('Could not confirm payment amount from blockchain');
        }
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + service.duration);
        const subscription = await this.prisma.subscription.create({
            data: {
                userId,
                servicePlanId: dto.servicePlanId,
                status: subscription_constants_1.SUBSCRIPTION_STATUS.ACTIVE,
                startDate: now,
                endDate: endDate,
                amount: verification.confirmedAmount,
                currency: 'ADA',
                txHash: dto.txHash,
                paymentDate: now,
            },
            include: { service: true },
        });
        return {
            result: true,
            message: 'Payment successful and subscription activated',
            data: { subscription },
        };
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        blockchain_service_1.BlockchainService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map