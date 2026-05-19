import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { RecordOperationVerifierService } from './record-operation.verifier.service';

type EntityType = 'PRODUCTION' | 'CONTAINER';

@Controller('record-operations')
@UseGuards(JwtAuthGuard)
export class RecordOperationController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verifier: RecordOperationVerifierService,
  ) {}

  private getCustodian(req: any): string {
    const custodian = req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!custodian) {
      throw new HttpException(
        'Không xác định được tài khoản từ phiên đăng nhập.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return String(custodian || '').trim();
  }

  @Post('verify-pending')
  async verifyPending() {
    await this.verifier.verifyPendingNow();
    return { ok: true };
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

    if (!entityType || (entityType !== 'PRODUCTION' && entityType !== 'CONTAINER')) {
      throw new HttpException('Thiếu entityType.', HttpStatus.BAD_REQUEST);
    }
    if (!entityKey) throw new HttpException('Thiếu entityKey.', HttpStatus.BAD_REQUEST);

    if (entityType === 'PRODUCTION') {
      const production = await (this.prisma as any).production.findUnique({
        where: { inventoryKey: entityKey },
        select: { registeringCustodianAddress: true },
      });
      if (
        !production ||
        String(production.registeringCustodianAddress || '').trim() !== custodian
      ) {
        throw new HttpException('Không tìm thấy bản ghi.', HttpStatus.NOT_FOUND);
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
        throw new HttpException('Không tìm thấy bản ghi.', HttpStatus.NOT_FOUND);
      }
    }
    const ops = await (this.prisma as any).recordOperation.findMany({
      where: { entityType, entityKey },
      orderBy: { createdAt: 'desc' },
    });

    return Array.isArray(ops) ? ops : [];
  }
}

