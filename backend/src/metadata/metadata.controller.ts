import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { CreateMetadataDto } from './dto/create-metadata.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
import { Public } from '../auth/public.decorator';

@Controller('metadata')
export class MetadataController {
  constructor(private metadataService: MetadataService) {}

  @Public()
  @Get()
  findAll() {
    return this.metadataService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.metadataService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateMetadataDto) {
    return this.metadataService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMetadataDto) {
    return this.metadataService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.metadataService.remove(id);
  }
}