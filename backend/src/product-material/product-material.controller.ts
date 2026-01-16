import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ProductMaterialService } from './product-material.service';
import { CreateProductMaterialDto } from './dto/create-product-material.dto';
import { UpdateProductMaterialDto } from './dto/update-product-material.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('product-materials')
export class ProductMaterialController {
  constructor(private service: ProductMaterialService) {}

  @Get()
  findByProduct(
    @CurrentUser() user: { id: string },
    @Query('productId') productId: string,
  ) {
    return this.service.findByProduct(productId, user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.findOne(id, user.id);
  }

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateProductMaterialDto,
  ) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateProductMaterialDto,
  ) {
    return this.service.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.remove(id, user.id);
  }
}
