import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Controller('suppliers')  // Route: /suppliers
export class SupplierController {
  constructor(private supplierService: SupplierService) {}

  @Get()  // GET /users
  findAll() {
    return this.supplierService.findAll();
  }

  @Get(':id')  // GET /users/:id
  findOne(@Param('id') id: string) {
    return this.supplierService.findOne(id);
  }

  @Post()  // POST /users
  create(@Body() dto: CreateSupplierDto) {
    return this.supplierService.create(dto);
  }

  @Patch(':id')  // PATCH /users/:id
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.supplierService.update(id, dto);
  }

  @Delete(':id')  // DELETE /users/:id
  remove(@Param('id') id: string) {
    return this.supplierService.remove(id);
  }
}