import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CertificationModule } from './certification/certification.module';
import { MaterialModule } from './material/material.module';
import { SupplierModule } from './supplier/supplier.module';
import { ServiceModule } from './service/service.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { AuthModule } from './auth/auth.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { ContractModule } from './contract/contract.module';
import { IpfsModule } from './ipfs/ipfs.module';
import { MediaModule } from './media/media.module';
import { ProductMaterialModule } from './product-material/product-material.module';
import { RedisModule } from './redis/redis.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    IpfsModule,
    AuthModule,
    UserModule,
    ProductModule,
    ProductMaterialModule,
    MediaModule,
    CertificationModule,
    MaterialModule,
    SupplierModule,
    ServiceModule,
    SubscriptionModule,
    BlockchainModule,
    ContractModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
