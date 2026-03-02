import { Controller, Post, Get, Body, Query, BadRequestException } from "@nestjs/common";
import { TraceService } from "./trace.service";
import { TraceBodyDto } from "./dto/trace.dto";

@Controller("trace")
export class TraceController {
  constructor(private readonly traceService: TraceService) {}

  @Post()
  async trace(@Body() body: TraceBodyDto) {
    if (!body?.policyId?.trim() || !body?.assetName?.trim()) {
      throw new BadRequestException("policyId and assetName are required.");
    }
    return this.traceService.trace(body.policyId.trim(), body.assetName.trim());
  }

  @Get()
  async getTrace(
    @Query("policyId") policyId: string,
    @Query("assetName") assetName: string,
  ) {
    if (!policyId?.trim() || !assetName?.trim()) {
      throw new BadRequestException("policyId and assetName are required.");
    }
    return this.traceService.trace(policyId.trim(), assetName.trim());
  }
}
