import { Module } from '@nestjs/common';
import { ProductMaterialController } from './product-material.controller';
import { ProductMaterialService } from './product-material.service';
import { PrismaModule } from '../prisma.module';
import { RedisModule } from '../redis/redis.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [PrismaModule, RedisModule, SubscriptionModule],
  controllers: [ProductMaterialController],
  providers: [ProductMaterialService],
  exports: [ProductMaterialService],
})
export class ProductMaterialModule {}
