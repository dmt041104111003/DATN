import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "../config/config.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ProductModule } from "../product/product.module";
import { AuthModule } from "../auth/auth.module";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    forwardRef(() => ProductModule),
    AuthModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
