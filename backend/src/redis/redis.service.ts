import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private subscriber: Redis;

  constructor() {
    const config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
    };

    this.client = new Redis(config);
    this.subscriber = new Redis(config);
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

  getClient(): Redis {
    return this.client;
  }

  getSubscriber(): Redis {
    return this.subscriber;
  }

  async set(key: string, value: string | number | object, ttlSeconds?: number): Promise<void> {
    const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
    ttlSeconds ? await this.client.setex(key, ttlSeconds, serialized) : await this.client.set(key, serialized);
  }

  async get<T = string>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async delMultiple(keys: string[]): Promise<number> {
    return keys.length > 0 ? this.client.del(...keys) : 0;
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    return (await this.client.expire(key, seconds)) === 1;
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async hset(key: string, field: string, value: string | number | object): Promise<number> {
    const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return this.client.hset(key, field, serialized);
  }

  async hsetMultiple(key: string, data: Record<string, string | number | object>): Promise<number> {
    const serialized: Record<string, string> = {};
    for (const [field, value] of Object.entries(data)) {
      serialized[field] = typeof value === 'object' ? JSON.stringify(value) : String(value);
    }
    return this.client.hset(key, serialized);
  }

  async hget<T = string>(key: string, field: string): Promise<T | null> {
    const value = await this.client.hget(key, field);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async hgetall<T = Record<string, string>>(key: string): Promise<T | null> {
    const data = await this.client.hgetall(key);
    if (Object.keys(data).length === 0) return null;
    const parsed: Record<string, any> = {};
    for (const [field, value] of Object.entries(data)) {
      try {
        parsed[field] = JSON.parse(value);
      } catch {
        parsed[field] = value;
      }
    }
    return parsed as T;
  }

  async hdel(key: string, field: string): Promise<number> {
    return this.client.hdel(key, field);
  }

  async lpush(key: string, ...values: (string | number | object)[]): Promise<number> {
    const serialized = values.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v));
    return this.client.lpush(key, ...serialized);
  }

  async rpush(key: string, ...values: (string | number | object)[]): Promise<number> {
    const serialized = values.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v));
    return this.client.rpush(key, ...serialized);
  }

  async lpop<T = string>(key: string): Promise<T | null> {
    const value = await this.client.lpop(key);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async rpop<T = string>(key: string): Promise<T | null> {
    const value = await this.client.rpop(key);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async lrange<T = string>(key: string, start: number, stop: number): Promise<T[]> {
    const values = await this.client.lrange(key, start, stop);
    return values.map(v => {
      try {
        return JSON.parse(v) as T;
      } catch {
        return v as T;
      }
    });
  }

  async llen(key: string): Promise<number> {
    return this.client.llen(key);
  }

  async sadd(key: string, ...members: (string | number)[]): Promise<number> {
    return this.client.sadd(key, ...members.map(String));
  }

  async sismember(key: string, member: string | number): Promise<boolean> {
    return (await this.client.sismember(key, String(member))) === 1;
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  async srem(key: string, ...members: (string | number)[]): Promise<number> {
    return this.client.srem(key, ...members.map(String));
  }

  async zadd(key: string, score: number, member: string | number): Promise<number> {
    return this.client.zadd(key, score, String(member));
  }

  async zrange(key: string, start: number, stop: number, withScores = false): Promise<string[]> {
    return withScores 
      ? this.client.zrange(key, start, stop, 'WITHSCORES')
      : this.client.zrange(key, start, stop);
  }

  async zrevrange(key: string, start: number, stop: number, withScores = false): Promise<string[]> {
    return withScores 
      ? this.client.zrevrange(key, start, stop, 'WITHSCORES')
      : this.client.zrevrange(key, start, stop);
  }

  async zscore(key: string, member: string | number): Promise<number | null> {
    const score = await this.client.zscore(key, String(member));
    return score === null ? null : parseFloat(score);
  }

  async publish(channel: string, message: string | object): Promise<number> {
    const serialized = typeof message === 'object' ? JSON.stringify(message) : message;
    return this.client.publish(channel, serialized);
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, msg) => {
      if (ch === channel) callback(msg);
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async incrby(key: string, increment: number): Promise<number> {
    return this.client.incrby(key, increment);
  }

  async decr(key: string): Promise<number> {
    return this.client.decr(key);
  }

  async decrby(key: string, decrement: number): Promise<number> {
    return this.client.decrby(key, decrement);
  }
}
