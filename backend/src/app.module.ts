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
import { FeedbackModule } from './feedback/feedback.module';
import { PaymentModule } from './payment/payment.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { WarehouseStorageModule } from './warehouse-storage/warehouse-storage.module';
import { ServiceModule } from './service/service.module';
import { SubscriptionModule } from './subscription/subscription.module';
@Module({
  imports: [
    UserModule, PrismaModule,
    ProductModule,
    CollectionModule,
    ProductionProcessModule,
    CertificationModule,
    MaterialModule,
    WarehouseModule,
    WarehouseStorageModule,
    FeedbackModule,
    ServiceModule,
    PaymentModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
