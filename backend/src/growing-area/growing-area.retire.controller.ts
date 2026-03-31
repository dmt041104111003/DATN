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

@Controller('growing-areas')
@UseGuards(JwtAuthGuard)
export class GrowingAreaRetireController {
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

    const existing = await (this.prisma as any).growingArea.findUnique({
      where: { inventoryKey: key },
    });
    if (!existing || existing.registeringCustodianAddress !== addr) {
      throw new HttpException('Growing area not found', HttpStatus.NOT_FOUND);
    }

    const planCount = await (this.prisma as any).plan.count({
      where: { growingAreaInventoryKey: key },
    });
    if (planCount > 0) {
      throw new HttpException(
        'Cannot retire this growing area because it still has plans attached.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const lastOp = await (this.prisma as any).recordOperation.findFirst({
      where: { entityType: 'GROWING_AREA', entityKey: key },
      orderBy: { createdAt: 'desc' },
    });
    if (lastOp && !lastOp.verified) {
      throw new HttpException(
        'This growing area is still being verified. Please try again soon.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await (this.prisma as any).recordOperation.create({
      data: {
        entityType: 'GROWING_AREA',
        entityKey: key,
        growingAreaInventoryKey: key,
        opType: 'RETIRE',
        txHash,
        verified: false,
        verifiedAt: null,
      } as any,
    });

    return { success: true };
  }
}

