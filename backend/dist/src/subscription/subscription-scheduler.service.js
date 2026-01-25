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
var SubscriptionSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma.service");
const subscription_constants_1 = require("./subscription.constants");
let SubscriptionSchedulerService = SubscriptionSchedulerService_1 = class SubscriptionSchedulerService {
    prisma;
    logger = new common_1.Logger(SubscriptionSchedulerService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkExpiringSubscriptions() {
        this.logger.log('Checking expiring subscriptions...');
        const now = new Date();
        const sevenDaysLater = new Date(now);
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
        const threeDaysLater = new Date(now);
        threeDaysLater.setDate(threeDaysLater.getDate() + 3);
        const oneDayLater = new Date(now);
        oneDayLater.setDate(oneDayLater.getDate() + 1);
        const activeSubscriptions = await this.prisma.subscription.findMany({
            where: {
                status: subscription_constants_1.SUBSCRIPTION_STATUS.ACTIVE,
                endDate: {
                    gte: now,
                    lte: sevenDaysLater,
                },
            },
            include: {
                user: true,
                service: true,
            },
        });
        for (const subscription of activeSubscriptions) {
            const daysUntilExpiry = Math.ceil((new Date(subscription.endDate).getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24));
            if (daysUntilExpiry === 7) {
                await this.sendNotification(subscription, 'Your subscription will expire in 7 days');
            }
            else if (daysUntilExpiry === 3) {
                await this.sendNotification(subscription, 'Your subscription will expire in 3 days');
            }
            else if (daysUntilExpiry === 1) {
                await this.sendNotification(subscription, 'Your subscription will expire in 1 day');
            }
        }
        this.logger.log(`Checked ${activeSubscriptions.length} subscriptions`);
    }
    async sendNotification(subscription, message) {
        this.logger.log(`Sending notification to user ${subscription.userId}: ${message}`);
        const notificationMessage = `${message}. Plan: ${subscription.service?.name || 'Unknown'}, Expires: ${new Date(subscription.endDate).toLocaleDateString()}`;
        console.log(`[NOTIFICATION] User: ${subscription.user.address}`);
        console.log(`[NOTIFICATION] Message: ${notificationMessage}`);
    }
};
exports.SubscriptionSchedulerService = SubscriptionSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_9AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionSchedulerService.prototype, "checkExpiringSubscriptions", null);
exports.SubscriptionSchedulerService = SubscriptionSchedulerService = SubscriptionSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionSchedulerService);
//# sourceMappingURL=subscription-scheduler.service.js.map