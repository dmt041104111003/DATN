import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { WarehouseStorageService } from './warehouse-storage.service';
import { CreateWarehouseStorageDto } from './dto/create-warehouse-storage.dto';
import { UpdateWarehouseStorageDto } from './dto/update-warehouse-storage.dto';

@Controller('warehouse-storages')
export class WarehouseStorageController {
  constructor(private warehouseStorageService: WarehouseStorageService) {}

  @Get()
  findAll() {
    return this.warehouseStorageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehouseStorageService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateWarehouseStorageDto) {
    return this.warehouseStorageService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWarehouseStorageDto) {
    return this.warehouseStorageService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.warehouseStorageService.remove(id);
  }
}