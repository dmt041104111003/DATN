import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProducerService } from './producer.service';

@Controller('producers')
@UseGuards(JwtAuthGuard)
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  private getWalletAddress(req: any): string {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return walletAddress;
  }

  @Get()
  async list(@Req() req: any) {
    return this.producerService.list(this.getWalletAddress(req));
  }

  @Post()
  async create(
    @Req() req: any,
    @Body() body: { name?: string; code?: string | null; location?: string | null; notes?: string | null },
  ) {
    return this.producerService.create(this.getWalletAddress(req), body);
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { name?: string; code?: string | null; location?: string | null; notes?: string | null },
  ) {
    return this.producerService.update(this.getWalletAddress(req), id, body);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.producerService.remove(this.getWalletAddress(req), id);
  }
}

