import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { WarehouseStorageService } from './warehouse-storage.service';
import { CreateWarehouseStorageDto } from './dto/create-warehouse-storage.dto';
import { UpdateWarehouseStorageDto } from './dto/update-warehouse-storage.dto';
import { Public, CurrentUser } from '../auth/decorators';

@Controller('warehouse-storages')
export class WarehouseStorageController {
  constructor(private warehouseStorageService: WarehouseStorageService) {}

  @Public()
  @Get()
  findAll() {
    return this.warehouseStorageService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehouseStorageService.findOne(id);
  }

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateWarehouseStorageDto,
  ) {
    return this.warehouseStorageService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseStorageDto,
  ) {
    return this.warehouseStorageService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.warehouseStorageService.remove(id, user.id);
  }
}
