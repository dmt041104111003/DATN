import { TraceService } from './trace.service';
export declare class TraceController {
    private readonly traceService;
    constructor(traceService: TraceService);
    getProductTrace(inventoryKey: string): Promise<import("./trace.service").TraceResult>;
    getProductTraceHistory(inventoryKey: string, page: number, limit: number): Promise<import("./trace.service").TraceHistoryResult>;
}
