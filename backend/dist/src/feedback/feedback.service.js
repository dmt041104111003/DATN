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
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const redis_service_1 = require("../redis/redis.service");
let FeedbackService = class FeedbackService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async findAll() {
        const cacheKey = 'feedbacks:all';
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const feedbacks = await this.prisma.feedback.findMany();
        await this.redis.set(cacheKey, feedbacks, 300);
        return feedbacks;
    }
    async findOne(id) {
        const cacheKey = `feedback:${id}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const item = await this.prisma.feedback.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Feedback not found');
        await this.redis.set(cacheKey, item, 300);
        return item;
    }
    async findOneOwned(id, userId) {
        const item = await this.findOne(id);
        if (!item || typeof item === 'string' || item.userId !== userId)
            throw new common_1.ForbiddenException('Not your feedback');
        return item;
    }
    async create(userId, dto) {
        const feedback = await this.prisma.feedback.create({
            data: { ...dto, userId },
        });
        await this.redis.delMultiple([
            'feedbacks:all',
            `feedbacks:product:${dto.productId}`,
        ]);
        return feedback;
    }
    async update(id, userId, dto) {
        const feedback = await this.findOneOwned(id, userId);
        const updated = await this.prisma.feedback.update({
            where: { id },
            data: dto,
        });
        if (feedback && typeof feedback === 'object' && 'productId' in feedback) {
            await this.redis.delMultiple([
                `feedback:${id}`,
                'feedbacks:all',
                `feedbacks:product:${feedback.productId}`,
            ]);
        }
        return updated;
    }
    async remove(id, userId) {
        const feedback = await this.findOneOwned(id, userId);
        await this.prisma.feedback.delete({ where: { id } });
        if (feedback && typeof feedback === 'object' && 'productId' in feedback) {
            await this.redis.delMultiple([
                `feedback:${id}`,
                'feedbacks:all',
                `feedbacks:product:${feedback.productId}`,
            ]);
        }
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map