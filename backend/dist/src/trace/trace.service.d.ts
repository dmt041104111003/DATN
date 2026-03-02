import type { TraceResponse } from "./domain/trace.types";
import { TraceAssetUseCase } from "./application/use-cases/trace-asset.use-case";
export declare class TraceService {
    private readonly traceAssetUseCase;
    constructor(traceAssetUseCase: TraceAssetUseCase);
    trace(policyId: string, assetName: string): Promise<TraceResponse>;
}
