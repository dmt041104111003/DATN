import { Injectable } from "@nestjs/common";
import type { TraceResponse } from "./domain/trace.types";
import { TraceAssetUseCase } from "./application/use-cases/trace-asset.use-case";

@Injectable()
export class TraceService {
  constructor(
    private readonly traceAssetUseCase: TraceAssetUseCase
  ) {}

  async trace(policyId: string, assetName: string): Promise<TraceResponse> {
    return this.traceAssetUseCase.execute(policyId, assetName);
  }
}
