import { Inject } from '@nestjs/common';
import { RedisService } from './redis.service';

export const InjectRedis = () => Inject(RedisService);
