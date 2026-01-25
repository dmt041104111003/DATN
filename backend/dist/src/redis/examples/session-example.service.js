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
exports.SessionExampleService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis.service");
let SessionExampleService = class SessionExampleService {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    async createSession(userId, address, walletName) {
        const sessionId = `session:${userId}`;
        const sessionData = {
            userId,
            address,
            walletName,
            loginAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
        };
        await this.redis.set(sessionId, sessionData, 7 * 24 * 60 * 60);
        return sessionId;
    }
    async getSession(userId) {
        return this.redis.get(`session:${userId}`);
    }
    async updateLastActivity(userId) {
        const session = await this.getSession(userId);
        if (session) {
            session.lastActivity = new Date().toISOString();
            await this.redis.set(`session:${userId}`, session, 7 * 24 * 60 * 60);
        }
    }
    async deleteSession(userId) {
        await this.redis.del(`session:${userId}`);
    }
    async isValidSession(userId) {
        return (await this.getSession(userId)) !== null;
    }
    async getAllUserSessions(userId) {
        const pattern = `session:${userId}:*`;
        const keys = await this.redis.keys(pattern);
        if (keys.length === 0) {
            const session = await this.getSession(userId);
            return session ? [session] : [];
        }
        const sessions = [];
        for (const key of keys) {
            const session = await this.redis.get(key);
            if (session)
                sessions.push(session);
        }
        return sessions;
    }
    async deleteAllUserSessions(userId) {
        const keys = await this.redis.keys(`session:${userId}*`);
        if (keys.length > 0)
            await this.redis.delMultiple(keys);
    }
};
exports.SessionExampleService = SessionExampleService;
exports.SessionExampleService = SessionExampleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], SessionExampleService);
//# sourceMappingURL=session-example.service.js.map