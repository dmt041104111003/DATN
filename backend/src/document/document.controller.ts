import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Public, CurrentUser } from '../auth/decorators';

@Controller('documents')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Public()
  @Get()
  findAll() {
    return this.documentService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateDocumentDto) {
    return this.documentService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.documentService.remove(id, user.id);
  }
}
