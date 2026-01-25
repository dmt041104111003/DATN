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
exports.RateLimitGuard = exports.RateLimitExampleService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis.service");
let RateLimitExampleService = class RateLimitExampleService {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    async checkRateLimit(identifier, maxRequests, windowSeconds) {
        const key = `ratelimit:${identifier}`;
        const current = await this.redis.incr(key);
        if (current === 1)
            await this.redis.expire(key, windowSeconds);
        return current <= maxRequests;
    }
    async getRemainingRequests(identifier, maxRequests) {
        const current = (await this.redis.get(`ratelimit:${identifier}`)) || 0;
        return Math.max(0, maxRequests - current);
    }
    async getRateLimitTTL(identifier) {
        return this.redis.ttl(`ratelimit:${identifier}`);
    }
    async resetRateLimit(identifier) {
        await this.redis.del(`ratelimit:${identifier}`);
    }
};
exports.RateLimitExampleService = RateLimitExampleService;
exports.RateLimitExampleService = RateLimitExampleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], RateLimitExampleService);
let RateLimitGuard = class RateLimitGuard {
    rateLimitService;
    constructor(rateLimitService) {
        this.rateLimitService = rateLimitService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const identifier = request.user?.id || request.ip || 'anonymous';
        const allowed = await this.rateLimitService.checkRateLimit(identifier, 100, 900);
        if (!allowed) {
            const remaining = await this.rateLimitService.getRemainingRequests(identifier, 100);
            const ttl = await this.rateLimitService.getRateLimitTTL(identifier);
            throw new common_1.HttpException({ message: 'Too many requests', remaining, retryAfter: ttl }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        return true;
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [RateLimitExampleService])
], RateLimitGuard);
//# sourceMappingURL=rate-limit-example.service.js.map