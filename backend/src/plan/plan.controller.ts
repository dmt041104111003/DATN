import {
  Body,
  Controller,
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
import { PlanService } from './plan.service';

@Controller('plans')
@UseGuards(JwtAuthGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  private getCustodian(req: any): string {
    const custodian = req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!custodian) {
      throw new HttpException(
        'Unable to determine account identity from session.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return custodian;
  }

  @Get()
  async list(@Req() req: any) {
    return this.planService.list(this.getCustodian(req));
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    try {
      return await this.planService.create(this.getCustodian(req), body);
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to register plan.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':inventoryKey')
  async update(@Req() req: any, @Param('inventoryKey') inventoryKey: string, @Body() body: any) {
    try {
      return await this.planService.update(this.getCustodian(req), inventoryKey, body);
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to update plan.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':inventoryKey/harvest')
  async harvest(@Req() req: any, @Param('inventoryKey') inventoryKey: string, @Body() body: any) {
    try {
      return await this.planService.harvest(this.getCustodian(req), inventoryKey, body);
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to close the plan.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':inventoryKey/packaging')
  async packaging(@Req() req: any, @Param('inventoryKey') inventoryKey: string, @Body() body: any) {
    try {
      return await this.planService.packaging(this.getCustodian(req), inventoryKey, body);
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to confirm packaging.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

