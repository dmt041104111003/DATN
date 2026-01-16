import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { Public } from '../auth/public.decorator';

@Controller('collections')
export class CollectionController {
  constructor(private collectionService: CollectionService) {}

  @Public()
  @Get()
  findAll() {
    return this.collectionService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCollectionDto) {
    return this.collectionService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCollectionDto) {
    return this.collectionService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.collectionService.remove(id);
  }
}