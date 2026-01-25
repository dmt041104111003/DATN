import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CollectionModule } from './collection/collection.module';
import { ProductionProcessModule } from './production-process/production-process.module';
import { CertificationModule } from './certification/certification.module';
import { MaterialModule } from './material/material.module';
import { SupplierModule } from './supplier/supplier.module';
import { FeedbackModule } from './feedback/feedback.module';
import { PaymentModule } from './payment/payment.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { WarehouseStorageModule } from './warehouse-storage/warehouse-storage.module';
import { ServiceModule } from './service/service.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { AuthModule } from './auth/auth.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { ContractModule } from './contract/contract.module';
import { IpfsModule } from './ipfs/ipfs.module';
import { MediaModule } from './media/media.module';
import { MetadataModule } from './metadata/metadata.module';
import { DocumentModule } from './document/document.module';
import { ProductMaterialModule } from './product-material/product-material.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards';
@Module({
  imports: [
    PrismaModule,
    IpfsModule,
    AuthModule,
    UserModule,
    ProductModule,
    ProductMaterialModule,
    CollectionModule,
    MetadataModule,
    MediaModule,
    DocumentModule,
    ProductionProcessModule,
    CertificationModule,
    MaterialModule,
    SupplierModule,
    WarehouseModule,
    WarehouseStorageModule,
    FeedbackModule,
    ServiceModule,
    PaymentModule,
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
