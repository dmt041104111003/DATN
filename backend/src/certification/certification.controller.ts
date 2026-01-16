import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CertificationService } from './certification.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
import { Public } from '../auth/public.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('certifications')
export class CertificationController {
  constructor(private certificationService: CertificationService) {}

  @Public()
  @Get()
  findAll() {
    return this.certificationService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.certificationService.findOne(id);
  }

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCertificationDto,
  ) {
    return this.certificationService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateCertificationDto,
  ) {
    return this.certificationService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.certificationService.remove(id, user.id);
  }
}
