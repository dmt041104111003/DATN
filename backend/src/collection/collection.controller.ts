import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { Public } from '../auth/public.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('collections')
export class CollectionController {
  constructor(private collectionService: CollectionService) {}

  @Public()
  @Get()
  findAll() {
    return this.collectionService.findAll();
  }

  @Get('my')
  findMy(@CurrentUser() user: { id: string }) {
    return this.collectionService.findAllByUser(user.id);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionService.findOne(id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateCollectionDto) {
    return this.collectionService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.collectionService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.collectionService.remove(id, user.id);
  }
}