import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { CreateMetadataDto } from './dto/create-metadata.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
import { Public } from '../auth/public.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

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
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateMetadataDto) {
    return this.metadataService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateMetadataDto,
  ) {
    return this.metadataService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.metadataService.remove(id, user.id);
  }
}
