import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CertificationService } from './certification.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';

@Controller('certifications')
export class CertificationController {
  constructor(private certificationService: CertificationService) {}

  @Get()
  findAll() {
    return this.certificationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.certificationService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCertificationDto) {
    return this.certificationService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCertificationDto) {
    return this.certificationService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.certificationService.remove(id);
  }
}