import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TraceService } from './trace.service';

@Controller('trace')
export class TraceController {
  constructor(private readonly traceService: TraceService) {}

  @Get(':inventoryKey')
  async getProductTrace(@Param('inventoryKey') inventoryKey: string) {
    const decoded = decodeURIComponent(inventoryKey);
    return this.traceService.getProductTrace(decoded);
  }

  @Get(':inventoryKey/history')
  async getProductTraceHistory(
    @Param('inventoryKey') inventoryKey: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const decoded = decodeURIComponent(inventoryKey);
    return this.traceService.getTraceHistory(decoded, page, limit);
  }
}
