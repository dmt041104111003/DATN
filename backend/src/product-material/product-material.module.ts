import { Module } from '@nestjs/common';
import { ProductMaterialController } from './product-material.controller';
import { ProductMaterialService } from './product-material.service';

@Module({
  controllers: [ProductMaterialController],
  providers: [ProductMaterialService],
  exports: [ProductMaterialService],
})
export class ProductMaterialModule {}
