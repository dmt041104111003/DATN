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
<<<<<<< HEAD
import { ListRoadmapUseCase } from "./application/use-cases/list-roadmap.use-case";
=======
>>>>>>> 69ccb5ee5f7e43f7dd7814ed74c72c1ef60b05c8

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
<<<<<<< HEAD
    ListRoadmapUseCase,
=======
>>>>>>> 69ccb5ee5f7e43f7dd7814ed74c72c1ef60b05c8
  ],
  exports: [ProductService],
})
export class ProductModule {}
