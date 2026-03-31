import { Controller, Get, Param } from '@nestjs/common';
import { TraceService } from './trace.service';

@Controller('trace')
export class TraceController {
  constructor(private readonly traceService: TraceService) {}

  @Get(':inventoryKey')
  async getProductTrace(@Param('inventoryKey') inventoryKey: string) {
    const decoded = decodeURIComponent(inventoryKey);
    return this.traceService.getProductTrace(decoded);
  }
}
