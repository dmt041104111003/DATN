import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ProductionProcessService } from './production-process.service';
import { CreateProductionProcessDto } from './dto/create-production-process.dto';
import { UpdateProductionProcessDto } from './dto/update-production-process.dto';

@Controller('production-processes')
export class ProductionProcessController {
  constructor(private productionProcessService: ProductionProcessService) {}

  @Get()
  findAll() {
    return this.productionProcessService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productionProcessService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProductionProcessDto) {
    return this.productionProcessService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductionProcessDto) {
    return this.productionProcessService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productionProcessService.remove(id);
  }
}