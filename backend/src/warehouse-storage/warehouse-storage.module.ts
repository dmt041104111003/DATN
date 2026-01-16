import { Module } from '@nestjs/common';
import { WarehouseStorageController } from './warehouse-storage.controller';
import { WarehouseStorageService } from './warehouse-storage.service';

@Module({
  controllers: [WarehouseStorageController],
  providers: [WarehouseStorageService],
  exports: [WarehouseStorageService],
})
export class WarehouseStorageModule {}