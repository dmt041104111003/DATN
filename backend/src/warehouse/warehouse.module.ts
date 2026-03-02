import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { WarehouseController } from "./warehouse.controller";
import { WarehouseService } from "./warehouse.service";
import { WAREHOUSE_REPOSITORY } from "./domain/warehouse.repository";
import { PrismaWarehouseRepository } from "./infra/prisma-warehouse.repository";
import { ListMyInventoryUseCase } from "./application/use-cases/list-my-inventory.use-case";
import { RemoveItemUseCase } from "./application/use-cases/remove-item.use-case";
import { MarkShippedUseCase } from "./application/use-cases/mark-shipped.use-case";
import { MarkBurnedUseCase } from "./application/use-cases/mark-burned.use-case";
import { AddToWarehouseUseCase } from "./application/use-cases/add-to-warehouse.use-case";
import { GetRecipientByRoadmapUseCase } from "./application/use-cases/get-recipient-by-roadmap.use-case";

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [WarehouseController],
  providers: [
    WarehouseService,
    {
      provide: WAREHOUSE_REPOSITORY,
      useClass: PrismaWarehouseRepository,
    },
    ListMyInventoryUseCase,
    RemoveItemUseCase,
    MarkShippedUseCase,
    MarkBurnedUseCase,
    AddToWarehouseUseCase,
    GetRecipientByRoadmapUseCase,
  ],
  exports: [WarehouseService],
})
export class WarehouseModule {}
