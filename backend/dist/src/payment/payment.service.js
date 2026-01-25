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
const blockchain_service_1 = require("../blockchain/blockchain.service");
let PaymentService = class PaymentService {
    prisma;
    blockchain;
    constructor(prisma, blockchain) {
        this.prisma = prisma;
        this.blockchain = blockchain;
    }
    async findAllByUser(userId) {
        return this.prisma.payment.findMany({
            where: { userId },
            include: { subscription: { include: { service: true } } },
        });
    }
    async findOne(id, userId) {
        const item = await this.prisma.payment.findUnique({
            where: { id },
            include: { subscription: { include: { service: true } } },
        });
        if (!item)
            throw new common_1.NotFoundException('Payment not found');
        if (item.userId !== userId)
            throw new common_1.ForbiddenException('Not your payment');
        return item;
    }
    async create(userId, dto) {
        if (dto.txHash) {
            const existingPayment = await this.prisma.payment.findFirst({
                where: { txHash: dto.txHash },
            });
            if (existingPayment) {
                throw new common_1.BadRequestException('Transaction hash already used');
            }
        }
        const subscription = await this.prisma.subscription.findUnique({
            where: { id: dto.subscriptionId },
            include: { service: true },
        });
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        if (subscription.userId !== userId) {
            throw new common_1.ForbiddenException('Not your subscription');
        }
        const expectedAmount = subscription.service.price;
        let verification = { valid: true, message: 'Verification skipped', confirmedAmount: expectedAmount };
        if (dto.txHash) {
            verification = await this.blockchain.verifyPayment(dto.txHash, expectedAmount);
            if (!verification.valid) {
                throw new common_1.BadRequestException(verification.message);
            }
            if (!verification.confirmedAmount) {
                throw new common_1.BadRequestException('Could not confirm payment amount from blockchain');
            }
        }
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + subscription.service.duration);
        const result = await this.prisma.$transaction(async (prisma) => {
            const payment = await prisma.payment.create({
                data: {
                    userId,
                    subscriptionId: dto.subscriptionId,
                    amount: verification.confirmedAmount,
                    currency: dto.currency || 'ADA',
                    txHash: dto.txHash || null,
                    paymentDate: now,
                },
            });
            const updatedSubscription = await prisma.subscription.update({
                where: { id: dto.subscriptionId },
                data: {
                    status: 'active',
                    startDate: now,
                    endDate: endDate,
                },
            });
            return { payment, subscription: updatedSubscription };
        });
        return {
            result: true,
            message: 'Payment verified and subscription activated',
            data: result,
        };
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        blockchain_service_1.BlockchainService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map