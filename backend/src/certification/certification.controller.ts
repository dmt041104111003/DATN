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
import { CertificationService } from './certification.service';

@Controller('certifications')
@UseGuards(JwtAuthGuard)
export class CertificationController {
  constructor(private readonly certificationService: CertificationService) {}

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
    return this.certificationService.list(this.getWalletAddress(req));
  }

  @Post()
  async create(
    @Req() req: any,
    @Body()
    body: {
      name?: string;
      issuer?: string | null;
      certCode?: string | null;
      validFrom?: string | null;
      validTo?: string | null;
      notes?: string | null;
    },
  ) {
    return this.certificationService.create(this.getWalletAddress(req), {
      name: body.name,
      issuer: body.issuer,
      certCode: body.certCode,
      validFrom: body.validFrom ? new Date(body.validFrom) : null,
      validTo: body.validTo ? new Date(body.validTo) : null,
      notes: body.notes,
    });
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      issuer?: string | null;
      certCode?: string | null;
      validFrom?: string | null;
      validTo?: string | null;
      notes?: string | null;
    },
  ) {
    return this.certificationService.update(this.getWalletAddress(req), id, {
      name: body.name,
      issuer: body.issuer,
      certCode: body.certCode,
      validFrom: body.validFrom ? new Date(body.validFrom) : null,
      validTo: body.validTo ? new Date(body.validTo) : null,
      notes: body.notes,
    });
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.certificationService.remove(this.getWalletAddress(req), id);
  }
}

