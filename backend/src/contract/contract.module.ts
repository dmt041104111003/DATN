import { Module } from '@nestjs/common';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { SubscriptionModule } from '../subscription/subscription.module';
import { ProductModule } from '../product/product.module';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [SubscriptionModule, ProductModule, PrismaModule],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
