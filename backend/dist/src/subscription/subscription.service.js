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
const redis_service_1 = require("../redis/redis.service");
const blockchain_service_1 = require("../blockchain/blockchain.service");
const subscription_constants_1 = require("./subscription.constants");
let SubscriptionService = class SubscriptionService {
    prisma;
    redis;
    blockchain;
    constructor(prisma, redis, blockchain) {
        this.prisma = prisma;
        this.redis = redis;
        this.blockchain = blockchain;
    }
    async findAllByUser(userId) {
        await this.updateExpiredSubscriptions(userId);
        const cacheKey = `subscriptions:user:${userId}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const subscriptions = await this.prisma.subscription.findMany({
            where: { userId },
            include: { service: true },
            orderBy: { createdAt: 'desc' },
        });
        await this.redis.set(cacheKey, subscriptions, 300);
        return subscriptions;
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
        const updated = await this.prisma.subscription.update({
            where: { id },
            data: { status: subscription_constants_1.SUBSCRIPTION_STATUS.CANCELLED },
            include: { service: true },
        });
        await this.redis.delMultiple([
            `subscriptions:user:${userId}`,
            `subscription:active:${userId}`,
        ]);
        return updated;
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
        const now = new Date();
        if (activeSubscription) {
            const currentService = await this.prisma.service.findUnique({
                where: { id: activeSubscription.servicePlanId },
            });
            if (!currentService) {
                await this.prisma.subscription.update({
                    where: { id: activeSubscription.id },
                    data: { status: subscription_constants_1.SUBSCRIPTION_STATUS.CANCELLED },
                });
            }
            else if (activeSubscription.servicePlanId === dto.servicePlanId) {
                throw new common_1.BadRequestException('Cannot renew. Current subscription will remain active until expiration.');
            }
            else {
                const isUpgrade = this.isUpgrade(currentService.price, service.price);
                if (isUpgrade) {
                    await this.prisma.subscription.update({
                        where: { id: activeSubscription.id },
                        data: { status: subscription_constants_1.SUBSCRIPTION_STATUS.CANCELLED },
                    });
                }
                else {
                    throw new common_1.BadRequestException('Cannot downgrade. Current subscription will remain active until expiration.');
                }
            }
        }
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + service.duration);
        const subscription = await this.prisma.subscription.create({
            data: {
                userId,
                servicePlanId: dto.servicePlanId,
                status: subscription_constants_1.SUBSCRIPTION_STATUS.PENDING,
                startDate: now,
                endDate: endDate,
                amount: service.price,
                currency: 'ADA',
                txHash: dto.txHash,
                paymentDate: now,
            },
            include: { service: true },
        });
        this.verifyPaymentAsync(subscription.id, dto.txHash, service.price, service.duration).catch((err) => {
            console.error('Background verification failed:', err);
        });
        return {
            result: true,
            message: 'Transaction submitted. Verification in progress...',
            data: { subscription },
        };
    }
    isUpgrade(currentPrice, newPrice) {
        return newPrice > currentPrice;
    }
    async verifyPaymentAsync(subscriptionId, txHash, expectedAmount, duration) {
        const verification = await this.blockchain.verifyPayment(txHash, expectedAmount, 30, 5000);
        if (!verification.valid) {
            await this.prisma.subscription.update({
                where: { id: subscriptionId },
                data: { status: subscription_constants_1.SUBSCRIPTION_STATUS.CANCELLED },
            });
            return;
        }
        if (!verification.confirmedAmount) {
            await this.prisma.subscription.update({
                where: { id: subscriptionId },
                data: { status: subscription_constants_1.SUBSCRIPTION_STATUS.CANCELLED },
            });
            return;
        }
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + duration);
        const subscription = await this.prisma.subscription.findUnique({
            where: { id: subscriptionId },
        });
        await this.prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                status: subscription_constants_1.SUBSCRIPTION_STATUS.ACTIVE,
                amount: verification.confirmedAmount,
                startDate: now,
                endDate: endDate,
                paymentDate: now,
            },
        });
        if (subscription) {
            await this.redis.delMultiple([
                `subscriptions:user:${subscription.userId}`,
                `subscription:active:${subscription.userId}`,
            ]);
        }
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        blockchain_service_1.BlockchainService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map