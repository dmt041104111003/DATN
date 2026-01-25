import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ProductionProcessService } from './production-process.service';
import { CreateProductionProcessDto } from './dto/create-production-process.dto';
import { UpdateProductionProcessDto } from './dto/update-production-process.dto';
import { Public, CurrentUser } from '../auth/decorators';

@Controller('production-processes')
export class ProductionProcessController {
  constructor(private productionProcessService: ProductionProcessService) {}

  @Public()
  @Get()
  findAll() {
    return this.productionProcessService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productionProcessService.findOne(id);
  }

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateProductionProcessDto,
  ) {
    return this.productionProcessService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateProductionProcessDto,
  ) {
    return this.productionProcessService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.productionProcessService.remove(id, user.id);
  }
}
