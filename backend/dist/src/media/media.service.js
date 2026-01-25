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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const redis_service_1 = require("../redis/redis.service");
const ipfs_service_1 = require("../ipfs/ipfs.service");
const subscription_service_1 = require("../subscription/subscription.service");
let MediaService = class MediaService {
    prisma;
    redis;
    ipfs;
    subscriptionService;
    constructor(prisma, redis, ipfs, subscriptionService) {
        this.prisma = prisma;
        this.redis = redis;
        this.ipfs = ipfs;
        this.subscriptionService = subscriptionService;
    }
    async checkSubscriptionActive(userId) {
        const subscription = await this.subscriptionService.getActiveSubscription(userId);
        if (!subscription) {
            throw new common_1.BadRequestException('Subscription has expired. Please renew to continue using this feature.');
        }
        return subscription;
    }
    async findAllByUser(userId) {
        const cacheKey = `media:user:${userId}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const media = await this.prisma.media.findMany({ where: { userId } });
        const result = media.map((m) => ({
            ...m,
            gatewayUrl: this.ipfs.toGatewayUrl(m.url),
        }));
        await this.redis.set(cacheKey, result, 300);
        return result;
    }
    async findOne(id, userId) {
        const cacheKey = `media:${id}`;
        const cached = await this.redis.get(cacheKey);
        if (cached && typeof cached === 'object') {
            if (cached.userId !== userId)
                throw new common_1.ForbiddenException('Not your media');
            return cached;
        }
        const item = await this.prisma.media.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Media not found');
        if (item.userId !== userId)
            throw new common_1.ForbiddenException('Not your media');
        const result = {
            ...item,
            gatewayUrl: this.ipfs.toGatewayUrl(item.url),
        };
        await this.redis.set(cacheKey, result, 300);
        return result;
    }
    async uploadToIpfs(userId, file) {
        await this.checkSubscriptionActive(userId);
        try {
            const { cid, url } = await this.ipfs.uploadFile(file, {
                name: file.originalname,
            });
            const type = this.getFileType(file.mimetype);
            const media = await this.prisma.media.create({
                data: {
                    userId,
                    name: file.originalname,
                    type,
                    url,
                },
            });
            await this.redis.del(`media:user:${userId}`);
            return {
                ...media,
                cid,
                gatewayUrl: this.ipfs.toGatewayUrl(url),
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException && error.message.includes('IPFS')) {
                throw new common_1.BadRequestException('Kết nối IPFS lỗi. Vui lòng thử lại sau hoặc liên hệ hỗ trợ kỹ thuật.');
            }
            throw error;
        }
    }
    async uploadBatchToIpfs(userId, files) {
        await this.checkSubscriptionActive(userId);
        const results = await Promise.allSettled(files.map((file) => this.uploadToIpfs(userId, file)));
        const successful = results
            .filter((r) => r.status === 'fulfilled')
            .map((r) => r.value);
        const failed = results
            .filter((r) => r.status === 'rejected')
            .map((r) => r.reason);
        if (failed.length > 0 && successful.length === 0) {
            throw new common_1.BadRequestException(`Upload failed: ${failed[0]?.message || 'Unable to upload file'}. Please try again.`);
        }
        return {
            successful,
            failed: failed.length,
            total: files.length,
        };
    }
    async update(id, userId, dto) {
        await this.findOne(id, userId);
        const updated = await this.prisma.media.update({
            where: { id },
            data: dto,
        });
        await this.redis.delMultiple([`media:${id}`, `media:user:${userId}`]);
        return updated;
    }
    async remove(id, userId) {
        const media = await this.findOne(id, userId);
        if (media && typeof media === 'object' && 'url' in media && media.url.startsWith('ipfs://')) {
            const cid = media.url.replace('ipfs://', '');
            await this.ipfs.unpin(cid);
        }
        await this.prisma.media.delete({ where: { id } });
        const mediaUserId = media && typeof media === 'object' && 'userId' in media ? media.userId : userId;
        await this.redis.delMultiple([`media:${id}`, `media:user:${mediaUserId}`]);
    }
    getFileType(mimetype) {
        if (mimetype.startsWith('image/'))
            return 'image';
        if (mimetype.startsWith('video/'))
            return 'video';
        if (mimetype === 'application/pdf')
            return 'pdf';
        return 'other';
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        ipfs_service_1.IpfsService,
        subscription_service_1.SubscriptionService])
], MediaService);
//# sourceMappingURL=media.service.js.map