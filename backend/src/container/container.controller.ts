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
import { ContainerService } from './container.service';

@Controller('container')
@UseGuards(JwtAuthGuard)
export class ContainerController {
  constructor(private readonly containerService: ContainerService) {}

  private getCustodian(req: any): string {
    const custodian = req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!custodian) {
      throw new HttpException('Unable to determine account identity from session.', HttpStatus.UNAUTHORIZED);
    }
    return custodian;
  }

  private getRole(req: any): string {
    return String(req?.user?.role || '').trim();
  }

  @Get()
  async list(@Req() req: any) {
    return this.containerService.list(this.getCustodian(req));
  }

  @Post('batches')
  async startBatch(@Req() req: any, @Body() body: any) {
    try {
      return await this.containerService.startBatch(this.getCustodian(req), body?.totalBoxes);
    } catch (e) {
      throw new HttpException(e instanceof Error ? e.message : 'Failed to start container batch.', HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('batches/:batchId')
  async updateBatch(@Req() req: any, @Param('batchId') batchId: string, @Body() body: any) {
    try {
      return await this.containerService.updateBatchProgress(batchId, body?.completedBoxes, body?.status);
    } catch (e) {
      throw new HttpException(e instanceof Error ? e.message : 'Failed to update container batch.', HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    try {
      return await this.containerService.create(this.getCustodian(req), body);
    } catch (e) {
      throw new HttpException(e instanceof Error ? e.message : 'Failed to register container.', HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':inventoryKey')
  async update(@Req() req: any, @Param('inventoryKey') inventoryKey: string, @Body() body: any) {
    try {
      return await this.containerService.update(this.getCustodian(req), inventoryKey, body);
    } catch (e) {
      throw new HttpException(e instanceof Error ? e.message : 'Failed to update container.', HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':inventoryKey')
  async remove(@Req() req: any, @Param('inventoryKey') inventoryKey: string, @Body() body: any) {
    try {
      return await this.containerService.deleteByInventoryKey(
        this.getCustodian(req),
        this.getRole(req),
        inventoryKey,
        body?.txHash,
      );
    } catch (e) {
      throw new HttpException(e instanceof Error ? e.message : 'Failed to delete container.', HttpStatus.BAD_REQUEST);
    }
  }
}
