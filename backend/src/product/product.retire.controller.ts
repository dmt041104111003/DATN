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

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductRetireController {
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

  @Post(':inventoryKey/retire')
  async retire(
    @Req() req: any,
    @Param('inventoryKey') inventoryKeyParam: string,
    @Body() body: { txHash: string },
  ) {
    const addr = this.getCustodian(req);
    const inventoryKey = decodeURIComponent(String(inventoryKeyParam || '').trim());
    const txHash = String(body?.txHash || '').trim();

    if (!inventoryKey) throw new HttpException('inventoryKey is required.', HttpStatus.BAD_REQUEST);
    if (!txHash) throw new HttpException('txHash is required.', HttpStatus.BAD_REQUEST);

    const existing = await (this.prisma as any).product.findUnique({
      where: { inventoryKey },
      select: { inventoryKey: true, registeringCustodianAddress: true, status: true },
    });
    if (!existing || String(existing.registeringCustodianAddress || '').trim() !== addr) {
      throw new HttpException('Product not found.', HttpStatus.NOT_FOUND);
    }
    if (String(existing.status || '').toUpperCase() === 'OUTBOUND_DISPATCH') {
      throw new HttpException(
        'This product was already dispatched from warehouse; retire is not allowed.',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (String(existing.status || '').toUpperCase() === 'CONSUMED') {
      throw new HttpException(
        'This product is already marked fully consumed; retire is not allowed.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const lastOp = await (this.prisma as any).recordOperation.findFirst({
      where: { entityType: 'PRODUCT', entityKey: inventoryKey },
      orderBy: { createdAt: 'desc' },
    });
    if (lastOp && !lastOp.verified) {
      throw new HttpException(
        'This product is still being verified. Please try again soon.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await (this.prisma as any).recordOperation.create({
      data: {
        entityType: 'PRODUCT',
        entityKey: inventoryKey,
        productInventoryKey: inventoryKey,
        opType: 'RETIRE',
        txHash,
        verified: false,
        verifiedAt: null,
      } as any,
    });

    return { success: true };
  }
}

