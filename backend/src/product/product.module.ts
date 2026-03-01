import { Module } from "@nestjs/common";
import { CardanoModule } from "../cardano/cardano.module";
import { AuthModule } from "../auth/auth.module";
import { WarehouseModule } from "../warehouse/warehouse.module";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";

@Module({
  imports: [CardanoModule, AuthModule, WarehouseModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
