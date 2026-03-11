import { Controller, Get, Param } from '@nestjs/common';
import { TraceService } from './trace.service';

@Controller('trace')
export class TraceController {
  constructor(private readonly traceService: TraceService) {}

  @Get(':unit')
  async getProductTrace(@Param('unit') unit: string) {
    const decodedUnit = decodeURIComponent(unit);
    return this.traceService.getProductTrace(decodedUnit);
  }
}
