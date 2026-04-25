import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UnitService } from './unit.service';

@Controller('units')
@UseGuards(JwtAuthGuard)
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  private getWalletAddress(req: any): string {
    const walletAddress = req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine account identity from session.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return walletAddress;
  }

  @Get()
  async list(@Req() req: any) {
    return this.unitService.list(this.getWalletAddress(req));
  }

  @Get(':id')
  async getOne(@Req() req: any, @Param('id') id: string) {
    return this.unitService.getOne(id, this.getWalletAddress(req));
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    return this.unitService.create(this.getWalletAddress(req), body);
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.unitService.update(id, this.getWalletAddress(req), body);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.unitService.remove(id, this.getWalletAddress(req));
  }
}
