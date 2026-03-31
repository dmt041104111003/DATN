import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

export interface CreateAgriLotDto {
  traceSchemeRef: string;
  lotReference: string;
  inventoryKey: string;
  confirmationRef: string;
  txHash?: string;
  custodyParties: string[];
  warehouseId?: string | null;
  planInventoryKey?: string | null;
  passport: {
    name: string;
    description: string;
    owners?: string;
    roadmap?: string;
    location?: string;
    image?: string;
    containerType?: string;
    maxWeightValue?: string;
    maxWeightUnit?: string;
    maxVolumeValue?: string;
    maxVolumeUnit?: string;
  };
}

export interface RefreshAgriLotDto {
  confirmationRef: string;
  custodyParties?: string[];
  warehouseId?: string | null;

  recordOutboundDispatch?: boolean;
  passport?: {
    name?: string;
    description?: string;
    owners?: string;
    roadmap?: string;
    location?: string;
    image?: string;
    dispatchImage?: string;
    checkinImage?: string;
    containerType?: string;
    maxWeightValue?: string;
    maxWeightUnit?: string;
    maxVolumeValue?: string;
    maxVolumeUnit?: string;
  };
}

export interface UpdateLotCheckpointDto {
  location?: string;
  confirmationRef?: string;
}

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('clear-warehouse')
  @UseGuards(JwtAuthGuard)
  async clearWarehouse(
    @Req() req: any,
    @Body()
    body: {
      inventoryKey?: string;
      status?: 'INBOUND_CHECKIN' | 'CONSUMED' | 'OUTBOUND_DISPATCH';
      confirmationRef?: string;
      consumeImage?: string;
    },
  ) {
    const custodian =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;

    if (!custodian) {
      throw new HttpException(
        'Unable to determine account identity from session.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const inventoryKey = (body?.inventoryKey || '').trim();
    if (!inventoryKey) {
      throw new HttpException('inventoryKey is required', HttpStatus.BAD_REQUEST);
    }

    const status = body?.status;
    const confirmationRef = (body?.confirmationRef || '').trim();
    const roleCode = (req.user?.role ?? req.user?.roleCode ?? '').toString();
    const roleUpper = roleCode.trim().toUpperCase();
    const canConsume = roleUpper === 'AGENT' || roleUpper === 'TRANSIT';
    if (status === 'CONSUMED' && !canConsume) {
      throw new HttpException(
        'Only field logistics or transit roles may mark a lot dispatched or fully consumed after outbound handling.',
        HttpStatus.FORBIDDEN,
      );
    }
    if (
      status === 'OUTBOUND_DISPATCH' &&
      roleUpper !== 'ENTERPRISE' &&
      roleUpper !== 'AGENT' &&
      roleUpper !== 'TRANSIT'
    ) {
      throw new HttpException(
        'Only producer enterprise or logistics site accounts may record outbound dispatch from warehouse.',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.productService.clearWarehouseByUnit(inventoryKey, custodian, {
      status,
      confirmationRef: confirmationRef || undefined,
      consumeImage: (body?.consumeImage || '').trim() || undefined,
      requesterRole: roleCode,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() body: CreateAgriLotDto) {
    try {
      const custodian =
        req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;

      if (!custodian) {
        throw new HttpException(
          'Unable to determine account identity from session.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return await this.productService.create({
        traceSchemeRef: body.traceSchemeRef,
        lotReference: body.lotReference,
        inventoryKey: body.inventoryKey,
        confirmationRef: body.confirmationRef,
        txHash: (body.txHash || '').trim() || undefined,
        custodyParties: body.custodyParties,
        warehouseId: body.warehouseId,
        planInventoryKey: (body.planInventoryKey ?? null) as any,
        passport: body.passport,
        registeringCustodianAddress: custodian,
      });
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to register agri traceability lot.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('lookup/:inventoryKey')
  @UseGuards(JwtAuthGuard)
  async lookupByUnit(@Req() req: any, @Param('inventoryKey') inventoryKey: string) {
    const custodian =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!custodian) {
      throw new HttpException(
        'Unable to determine account identity from session.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const decoded = decodeURIComponent((inventoryKey || '').trim());
    const result = await this.productService.findForSessionByInventoryKey(decoded, custodian);
    if (!result.ok) {
      if (result.reason === 'not_found') {
        throw new HttpException('Agri traceability lot not found.', HttpStatus.NOT_FOUND);
      }
      if (result.reason === 'forbidden') {
        throw new HttpException(
          'This wallet is not on the custody roster for this lot.',
          HttpStatus.FORBIDDEN,
        );
      }
      throw new HttpException('Invalid request.', HttpStatus.BAD_REQUEST);
    }
    return result.product;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: any) {
    try {
      const custodian =
        req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;

      if (!custodian) {
        throw new HttpException(
          'Unable to determine account identity from session.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return await this.productService.findAll(custodian);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to fetch products',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':inventoryKey')
  @UseGuards(JwtAuthGuard)
  async updateByUnit(
    @Req() req: any,
    @Param('inventoryKey') inventoryKey: string,
    @Body() body: RefreshAgriLotDto,
  ) {
    try {
      const custodian =
        req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;

      if (!custodian) {
        throw new HttpException(
          'Unable to determine account identity from session.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const roleCode = (req.user?.role ?? req.user?.roleCode ?? '').toString();
      const result = await this.productService.updateByUnit(inventoryKey, custodian, {
        confirmationRef: body.confirmationRef,
        custodyParties: body.custodyParties,
        passport: body.passport,
        requesterRole: roleCode,
        warehouseId: body.warehouseId,
        recordOutboundDispatch: body.recordOutboundDispatch === true,
      });
      if (!result?.success) {
        throw new HttpException(
          result?.message || 'Chain-of-custody policy denied this update.',
          HttpStatus.BAD_REQUEST,
        );
      }
      return result;
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to update the lot passport.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':inventoryKey/location')
  @UseGuards(JwtAuthGuard)
  async updateLocation(
    @Req() req: any,
    @Param('inventoryKey') inventoryKey: string,
    @Body() body: UpdateLotCheckpointDto,
  ) {
    const custodian =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!custodian) {
      throw new HttpException(
        'Unable to determine account identity from session.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const location = (body?.location || '').trim();
    const confirmationRef = (body?.confirmationRef || '').trim();
    if (!location || !confirmationRef) {
      throw new HttpException(
        'location and confirmationRef are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const roleCode = (req.user?.role ?? req.user?.roleCode ?? '').toString();
    const result = await this.productService.updateLocationByUnit({
      unit: inventoryKey,
      walletAddress: custodian,
      location,
      confirmationRef,
      requesterRole: roleCode,
    });
    if (!result?.success) {
      throw new HttpException(
        result?.message || 'Chain-of-custody policy denied this update.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return result;
  }

  @Delete(':inventoryKey')
  @UseGuards(JwtAuthGuard)
  async deleteByUnit(@Req() req: any, @Param('inventoryKey') inventoryKey: string) {
    try {
      const custodian =
        req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;

      if (!custodian) {
        throw new HttpException(
          'Unable to determine account identity from session.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const roleCode = (req.user?.role ?? req.user?.roleCode ?? '').toString();
      const result = await this.productService.deleteByUnit(inventoryKey, custodian, {
        requesterRole: roleCode,
      });
      if (!result?.success) {
        throw new HttpException(
          result?.message || 'Chain-of-custody policy denied this action.',
          HttpStatus.BAD_REQUEST,
        );
      }
      return result;
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to retire traceability lot from custody.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
