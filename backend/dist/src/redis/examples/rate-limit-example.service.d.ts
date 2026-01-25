import { CanActivate, ExecutionContext } from '@nestjs/common';
import { RedisService } from '../redis.service';
export declare class RateLimitExampleService {
    private redis;
    constructor(redis: RedisService);
    checkRateLimit(identifier: string, maxRequests: number, windowSeconds: number): Promise<boolean>;
    getRemainingRequests(identifier: string, maxRequests: number): Promise<number>;
    getRateLimitTTL(identifier: string): Promise<number>;
    resetRateLimit(identifier: string): Promise<void>;
}
export declare class RateLimitGuard implements CanActivate {
    private rateLimitService;
    constructor(rateLimitService: RateLimitExampleService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
