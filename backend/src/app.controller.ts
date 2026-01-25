import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getUsers() {
    return this.appService.getUsers();
  }

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
