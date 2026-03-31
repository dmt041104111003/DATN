import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('plans')
@UseGuards(JwtAuthGuard)
export class PlanRetireController {
  constructor(private readonly prisma: PrismaService) {}

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

  @Post(':inventoryKey/retire')
  async retire(
    @Req() req: any,
    @Param('inventoryKey') inventoryKey: string,
    @Body() body: { txHash: string },
  ) {
    const addr = this.getCustodian(req);
    const key = decodeURIComponent(String(inventoryKey || '').trim());
    const txHash = String(body?.txHash || '').trim();
    if (!key) throw new HttpException('inventoryKey is required.', HttpStatus.BAD_REQUEST);
    if (!txHash) throw new HttpException('txHash is required.', HttpStatus.BAD_REQUEST);

    const existing = await (this.prisma as any).plan.findUnique({
      where: { inventoryKey: key },
    });
    if (!existing || existing.createdBy !== addr) {
      throw new HttpException('Plan not found', HttpStatus.NOT_FOUND);
    }
    if (String(existing.stage || '').trim().toUpperCase() === 'HARVESTED') {
      throw new HttpException('This plan is already closed.', HttpStatus.BAD_REQUEST);
    }

    const lastOp = await (this.prisma as any).recordOperation.findFirst({
      where: { entityType: 'PLAN', entityKey: key },
      orderBy: { createdAt: 'desc' },
    });
    if (lastOp && !lastOp.verified) {
      throw new HttpException(
        'This plan is still being verified. Please try again soon.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await (this.prisma as any).recordOperation.create({
      data: {
        entityType: 'PLAN',
        entityKey: key,
        planInventoryKey: key,
        opType: 'RETIRE',
        txHash,
        verified: false,
        verifiedAt: null,
      } as any,
    });

    return { success: true };
  }
}

