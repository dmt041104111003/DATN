import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')  // Route: /products
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()  // GET /users
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')  // GET /users/:id
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Post()  // POST /users
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Patch(':id')  // PATCH /users/:id
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')  // DELETE /users/:id
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}