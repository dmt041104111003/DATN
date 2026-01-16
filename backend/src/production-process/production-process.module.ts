import { Module } from '@nestjs/common';
import { ProductionProcessController } from './production-process.controller';
import { ProductionProcessService } from './production-process.service';

@Module({
  controllers: [ProductionProcessController],
  providers: [ProductionProcessService],
  exports: [ProductionProcessService],
})
export class ProductionProcessModule {}
