import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Public } from '../auth/decorators';

@Controller('warehouses')
export class WarehouseController {
  constructor(private warehouseService: WarehouseService) {}

  @Public()
  @Get()
  findAll() {
    return this.warehouseService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehouseService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehouseService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    return this.warehouseService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.warehouseService.remove(id);
  }
}
