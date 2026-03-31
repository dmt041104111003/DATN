import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

type EntityType = 'PLAN' | 'GROWING_AREA' | 'CONTAINER';

@Controller('record-operations')
@UseGuards(JwtAuthGuard)
export class RecordOperationController {
  constructor(private readonly prisma: PrismaService) {}

  private getCustodian(req: any): string {
    const custodian = req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!custodian) {
      throw new HttpException(
        'Unable to determine account identity from session.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return String(custodian || '').trim();
  }

  @Get()
  async list(
    @Req() req: any,
    @Query('entityType') entityTypeParam: string,
    @Query('entityKey') entityKeyParam: string,
  ) {
    const custodian = this.getCustodian(req);
    const entityType = String(entityTypeParam || '').trim().toUpperCase() as EntityType;
    const entityKey = decodeURIComponent(String(entityKeyParam || '').trim());

    if (
      !entityType ||
      (entityType !== 'PLAN' && entityType !== 'GROWING_AREA' && entityType !== 'CONTAINER')
    ) {
      throw new HttpException('entityType is required.', HttpStatus.BAD_REQUEST);
    }
    if (!entityKey) throw new HttpException('entityKey is required.', HttpStatus.BAD_REQUEST);

    if (entityType === 'PLAN') {
      const plan = await (this.prisma as any).plan.findUnique({
        where: { inventoryKey: entityKey },
        select: { createdBy: true },
      });
      if (!plan || String(plan.createdBy || '').trim() !== custodian) {
        throw new HttpException('Record not found.', HttpStatus.NOT_FOUND);
      }
    }
    if (entityType === 'GROWING_AREA') {
      const area = await (this.prisma as any).growingArea.findUnique({
        where: { inventoryKey: entityKey },
        select: { registeringCustodianAddress: true },
      });
      if (!area || String(area.registeringCustodianAddress || '').trim() !== custodian) {
        throw new HttpException('Record not found.', HttpStatus.NOT_FOUND);
      }
    }
    if (entityType === 'CONTAINER') {
      const container = await (this.prisma as any).container.findUnique({
        where: { inventoryKey: entityKey },
        select: { registeringCustodianAddress: true },
      });
      if (
        !container ||
        String(container.registeringCustodianAddress || '').trim() !== custodian
      ) {
        throw new HttpException('Record not found.', HttpStatus.NOT_FOUND);
      }
    }

    const ops = await (this.prisma as any).recordOperation.findMany({
      where: { entityType, entityKey },
      orderBy: { createdAt: 'desc' },
    });

    return Array.isArray(ops) ? ops : [];
  }
}

