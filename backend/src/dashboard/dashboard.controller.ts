import { Controller, Get, HttpException, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  private getCustodian(req: any): string {
    const custodian = req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!custodian) {
      throw new HttpException('Không xác định được ví đăng nhập.', HttpStatus.UNAUTHORIZED);
    }
    return String(custodian).trim();
  }

  private getRole(req: any): string {
    return String(req?.user?.role || req?.user?.roleCode || '').trim();
  }

  @Get('stats')
  async stats(@Req() req: any) {
    try {
      return await this.dashboardService.getStats(this.getCustodian(req), this.getRole(req));
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Không tải được thống kê.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
