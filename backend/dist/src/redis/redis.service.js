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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    logger = new common_1.Logger(RedisService_1.name);
    client;
    subscriber;
    constructor() {
        const config = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD || undefined,
            db: parseInt(process.env.REDIS_DB || '0'),
            retryStrategy: (times) => Math.min(times * 50, 2000),
        };
        this.client = new ioredis_1.default(config);
        this.subscriber = new ioredis_1.default(config);
    }
    async onModuleInit() {
        this.client.on('connect', () => this.logger.log('Redis client connected'));
        this.client.on('error', (err) => this.logger.error('Redis client error:', err));
        this.subscriber.on('connect', () => this.logger.log('Redis subscriber connected'));
        this.subscriber.on('error', (err) => this.logger.error('Redis subscriber error:', err));
    }
    async onModuleDestroy() {
        await this.client.quit();
        await this.subscriber.quit();
        this.logger.log('Redis connections closed');
    }
    getClient() {
        return this.client;
    }
    getSubscriber() {
        return this.subscriber;
    }
    async set(key, value, ttlSeconds) {
        const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
        ttlSeconds ? await this.client.setex(key, ttlSeconds, serialized) : await this.client.set(key, serialized);
    }
    async get(key) {
        const value = await this.client.get(key);
        if (value === null)
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    async del(key) {
        return this.client.del(key);
    }
    async delMultiple(keys) {
        return keys.length > 0 ? this.client.del(...keys) : 0;
    }
    async exists(key) {
        return (await this.client.exists(key)) === 1;
    }
    async expire(key, seconds) {
        return (await this.client.expire(key, seconds)) === 1;
    }
    async ttl(key) {
        return this.client.ttl(key);
    }
    async hset(key, field, value) {
        const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
        return this.client.hset(key, field, serialized);
    }
    async hsetMultiple(key, data) {
        const serialized = {};
        for (const [field, value] of Object.entries(data)) {
            serialized[field] = typeof value === 'object' ? JSON.stringify(value) : String(value);
        }
        return this.client.hset(key, serialized);
    }
    async hget(key, field) {
        const value = await this.client.hget(key, field);
        if (value === null)
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    async hgetall(key) {
        const data = await this.client.hgetall(key);
        if (Object.keys(data).length === 0)
            return null;
        const parsed = {};
        for (const [field, value] of Object.entries(data)) {
            try {
                parsed[field] = JSON.parse(value);
            }
            catch {
                parsed[field] = value;
            }
        }
        return parsed;
    }
    async hdel(key, field) {
        return this.client.hdel(key, field);
    }
    async lpush(key, ...values) {
        const serialized = values.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v));
        return this.client.lpush(key, ...serialized);
    }
    async rpush(key, ...values) {
        const serialized = values.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v));
        return this.client.rpush(key, ...serialized);
    }
    async lpop(key) {
        const value = await this.client.lpop(key);
        if (value === null)
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    async rpop(key) {
        const value = await this.client.rpop(key);
        if (value === null)
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    async lrange(key, start, stop) {
        const values = await this.client.lrange(key, start, stop);
        return values.map(v => {
            try {
                return JSON.parse(v);
            }
            catch {
                return v;
            }
        });
    }
    async llen(key) {
        return this.client.llen(key);
    }
    async sadd(key, ...members) {
        return this.client.sadd(key, ...members.map(String));
    }
    async sismember(key, member) {
        return (await this.client.sismember(key, String(member))) === 1;
    }
    async smembers(key) {
        return this.client.smembers(key);
    }
    async srem(key, ...members) {
        return this.client.srem(key, ...members.map(String));
    }
    async zadd(key, score, member) {
        return this.client.zadd(key, score, String(member));
    }
    async zrange(key, start, stop, withScores = false) {
        return withScores
            ? this.client.zrange(key, start, stop, 'WITHSCORES')
            : this.client.zrange(key, start, stop);
    }
    async zrevrange(key, start, stop, withScores = false) {
        return withScores
            ? this.client.zrevrange(key, start, stop, 'WITHSCORES')
            : this.client.zrevrange(key, start, stop);
    }
    async zscore(key, member) {
        const score = await this.client.zscore(key, String(member));
        return score === null ? null : parseFloat(score);
    }
    async publish(channel, message) {
        const serialized = typeof message === 'object' ? JSON.stringify(message) : message;
        return this.client.publish(channel, serialized);
    }
    async subscribe(channel, callback) {
        await this.subscriber.subscribe(channel);
        this.subscriber.on('message', (ch, msg) => {
            if (ch === channel)
                callback(msg);
        });
    }
    async unsubscribe(channel) {
        await this.subscriber.unsubscribe(channel);
    }
    async keys(pattern) {
        return this.client.keys(pattern);
    }
    async incr(key) {
        return this.client.incr(key);
    }
    async incrby(key, increment) {
        return this.client.incrby(key, increment);
    }
    async decr(key) {
        return this.client.decr(key);
    }
    async decrby(key, decrement) {
        return this.client.decrby(key, decrement);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RedisService);
//# sourceMappingURL=redis.service.js.map