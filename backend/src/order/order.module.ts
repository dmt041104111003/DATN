import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "../core/config/config.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ProductModule } from "../product/product.module";
import { AuthModule } from "../auth/auth.module";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import { ORDER_REPOSITORY } from "./domain/order.repository";
import { PrismaOrderRepository } from "./infra/prisma-order.repository";
import { ListOrdersForProfileUseCase } from "./application/use-cases/list-orders-for-profile.use-case";
import { SavePartialSignedTxUseCase } from "./application/use-cases/save-partial-signed-tx.use-case";
import { RecordOrderUseCase } from "./application/use-cases/record-order.use-case";
import { ConfirmOrderCompleteUseCase } from "./application/use-cases/confirm-order-complete.use-case";

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    forwardRef(() => ProductModule),
    AuthModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
    ListOrdersForProfileUseCase,
    SavePartialSignedTxUseCase,
    RecordOrderUseCase,
    ConfirmOrderCompleteUseCase,
  ],
  exports: [OrderService],
})
export class OrderModule {}
