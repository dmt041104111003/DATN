import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('materials')
export class MaterialController {
  constructor(private materialService: MaterialService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.materialService.findAllByUser(user.id);
  }
  @Get('by-supplier/:supplierId')
  findBySupplier(
    @CurrentUser() user: { id: string },
    @Param('supplierId') supplierId: string,
  ) {
    return this.materialService.findBySupplier(supplierId, user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.materialService.findOne(id, user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateMaterialDto) {
    return this.materialService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateMaterialDto,
  ) {
    return this.materialService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.materialService.remove(id, user.id);
  }
}
