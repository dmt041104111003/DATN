import { Module } from "@nestjs/common";
import { CardanoModule } from "../core/cardano/cardano.module";
import { AuthModule } from "../auth/auth.module";
import { WarehouseModule } from "../warehouse/warehouse.module";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { PRODUCT_REPOSITORY } from "./domain/product.repository";
import { PrismaProductRepository } from "./infra/prisma-product.repository";
import { ListBatchesUseCase } from "./application/use-cases/list-batches.use-case";
import { RecordProductTxUseCase } from "./application/use-cases/record-product-tx.use-case";

@Module({
  imports: [CardanoModule, AuthModule, WarehouseModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    ListBatchesUseCase,
    RecordProductTxUseCase,
  ],
  exports: [ProductService],
})
export class ProductModule {}
