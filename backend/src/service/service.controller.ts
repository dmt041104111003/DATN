import { Controller, Get, Param } from '@nestjs/common';
import { ServiceService } from './service.service';
import { Public } from '../auth/public.decorator';

@Controller('services')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @Public()
  @Get()
  findAll() {
    return this.serviceService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }

}
