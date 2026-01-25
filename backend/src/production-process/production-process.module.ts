import { Module } from '@nestjs/common';
import { ProductionProcessController } from './production-process.controller';
import { ProductionProcessService } from './production-process.service';
import { PrismaModule } from '../prisma.module';
import { RedisModule } from '../redis/redis.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [PrismaModule, RedisModule, SubscriptionModule],
  controllers: [ProductionProcessController],
  providers: [ProductionProcessService],
  exports: [ProductionProcessService],
})
export class ProductionProcessModule {}
