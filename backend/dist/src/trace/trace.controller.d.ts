import { TraceService } from "./trace.service";
import { AuthService } from "../auth/auth.service";
import { MintTraceDto, UpdateTraceDto, RevokeTraceDto, MintConfirmDto, UpdateConfirmDto, RevokeConfirmDto, SubmitTxDto } from "./dto/trace.dto";
export declare class TraceController {
    private readonly trace;
    private readonly auth;
    constructor(trace: TraceService, auth: AuthService);
    listBatches(token?: string): Promise<{
        total: number;
        items: {
            id: string;
            name: string;
            image: string | null;
            createdAt: Date;
        }[];
    }>;
    mint(body: MintTraceDto): Promise<{
        unsignedTx: string;
        policyId?: string;
    }>;
    update(body: UpdateTraceDto): Promise<{
        unsignedTx: string;
    }>;
    revoke(body: RevokeTraceDto): Promise<{
        unsignedTx: string;
    }>;
    mintConfirm(body: MintConfirmDto): Promise<{
        ok: boolean;
    }>;
    updateConfirm(body: UpdateConfirmDto): Promise<{
        ok: boolean;
    }>;
    revokeConfirm(body: RevokeConfirmDto): Promise<{
        ok: boolean;
    }>;
    submit(body: SubmitTxDto): Promise<{
        txHash: string;
    }>;
}
