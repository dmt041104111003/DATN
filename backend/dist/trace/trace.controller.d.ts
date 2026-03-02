import { TraceService } from "./trace.service";
import { TraceBodyDto } from "./dto/trace.dto";
export declare class TraceController {
    private readonly traceService;
    constructor(traceService: TraceService);
    trace(body: TraceBodyDto): Promise<import("./domain/trace.types").TraceResponse>;
    getTrace(policyId: string, assetName: string): Promise<import("./domain/trace.types").TraceResponse>;
}
