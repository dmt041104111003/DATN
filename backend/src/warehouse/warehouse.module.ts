import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { WarehouseController } from "./warehouse.controller";
import { WarehouseService } from "./warehouse.service";

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [WarehouseController],
  providers: [WarehouseService],
  exports: [WarehouseService],
})
export class WarehouseModule {}
