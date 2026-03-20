import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrderService, OrderCheckResult } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('check')
  async check(
    @Req() req: any,
    @Body() body: { assetName?: string },
  ): Promise<OrderCheckResult> {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;

    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.orderService.checkOrder(
      walletAddress,
      body?.assetName ?? '',
    );
  }

  @Post('clear-warehouse')
  async clearWarehouse(
    @Req() req: any,
    @Body() body: { unit?: string; status?: 'ACTIVE' | 'CONSUMED'; txHash?: string },
  ) {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;

    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const unit = (body?.unit || '').trim();
    if (!unit) {
      throw new HttpException('unit is required', HttpStatus.BAD_REQUEST);
    }

    const status = body?.status;
    const txHash = (body?.txHash || '').trim();
    const roleCode = (req.user?.role ?? req.user?.roleCode ?? '').toString();
    if (status === 'CONSUMED' && roleCode !== 'AGENT') {
      throw new HttpException('Only AGENT can mark asset as CONSUMED', HttpStatus.FORBIDDEN);
    }

    return this.orderService.clearAssetFromWarehouse(walletAddress, unit, {
      status,
      txHash: txHash || undefined,
    });
  }

  @Post('sent')
  async listSent(@Req() req: any) {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.orderService.listSentOrders(walletAddress);
  }

  @Post('incoming')
  async listIncoming(@Req() req: any) {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.orderService.listIncomingOrders(walletAddress);
  }

  @Post('create')
  async createOrder(@Req() req: any, @Body() body: {
    receiverWalletAddress?: string;
    policyId?: string;
    assetName?: string;
    unit?: string;
    txHash?: string;
  }) {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const receiverWalletAddress = (body?.receiverWalletAddress || '').trim();
    const policyId = (body?.policyId || '').trim();
    const assetName = (body?.assetName || '').trim();
    const unit = (body?.unit || '').trim();
    const txHash = (body?.txHash || '').trim();

    if (!receiverWalletAddress || !policyId || !assetName || !unit) {
      throw new HttpException('Missing fields', HttpStatus.BAD_REQUEST);
    }

    return this.orderService.createShippedOrder({
      senderWalletAddress: walletAddress,
      receiverWalletAddress,
      policyId,
      assetName,
      unit,
      txHash: txHash || null,
    });
  }

  @Post('ship')
  async ship(@Req() req: any, @Body() body: {
    receiverWalletAddress?: string;
    policyId?: string;
    assetName?: string;
    unit?: string;
    txHash?: string;
  }) {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const receiverWalletAddress = (body?.receiverWalletAddress || '').trim();
    const policyId = (body?.policyId || '').trim();
    const assetName = (body?.assetName || '').trim();
    const unit = (body?.unit || '').trim();
    const txHash = (body?.txHash || '').trim();

    if (!receiverWalletAddress || !policyId || !assetName || !unit) {
      throw new HttpException('Missing fields', HttpStatus.BAD_REQUEST);
    }

    return this.orderService.ship({
      senderWalletAddress: walletAddress,
      receiverWalletAddress,
      policyId,
      assetName,
      unit,
      txHash: txHash || null,
    });
  }

  @Post('confirm-receive')
  async confirmReceive(@Req() req: any, @Body() body: { orderId?: string; warehouseId?: string }) {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const orderId = (body?.orderId || '').trim();
    const warehouseId = (body?.warehouseId || '').trim();
    if (!orderId || !warehouseId) {
      throw new HttpException('orderId and warehouseId are required', HttpStatus.BAD_REQUEST);
    }

    return this.orderService.confirmReceive({
      receiverWalletAddress: walletAddress,
      orderId,
      warehouseId,
    });
  }

  @Post('owners')
  async owners(@Req() req: any, @Body() body: { orderId?: string }) {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const orderId = (body?.orderId || '').trim();
    if (!orderId) {
      throw new HttpException('orderId is required', HttpStatus.BAD_REQUEST);
    }

    return this.orderService.getOwnersForOrder({
      receiverWalletAddress: walletAddress,
      orderId,
    });
  }

  @Post('delete-sent')
  async deleteSent(@Req() req: any, @Body() body: { orderId?: string }) {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const orderId = (body?.orderId || '').trim();
    if (!orderId) {
      throw new HttpException('orderId is required', HttpStatus.BAD_REQUEST);
    }
    const result = await this.orderService.deleteSentOrder(
      walletAddress,
      orderId,
    );
    if (!result?.success) {
      throw new HttpException(
        result?.message || 'Failed to delete order',
        HttpStatus.BAD_REQUEST,
      );
    }
    return result;
  }

  @Post('delete-incoming')
  async deleteIncoming(@Req() req: any, @Body() body: { orderId?: string }) {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const orderId = (body?.orderId || '').trim();
    if (!orderId) {
      throw new HttpException('orderId is required', HttpStatus.BAD_REQUEST);
    }
    const result = await this.orderService.deleteIncomingOrder(
      walletAddress,
      orderId,
    );
    if (!result?.success) {
      throw new HttpException(
        result?.message || 'Failed to delete order',
        HttpStatus.BAD_REQUEST,
      );
    }
    return result;
  }
}
