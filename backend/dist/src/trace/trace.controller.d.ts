import { TraceService } from "./trace.service";
import { AuthService } from "../auth/auth.service";
import { MintTraceDto, UpdateTraceDto, RevokeTraceDto, BurnTraceDto, MintConfirmDto, UpdateConfirmDto, RevokeConfirmDto, BurnConfirmDto, RemoveWarehouseItemDto, SubmitTxDto } from "./dto/trace.dto";
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
    getMyWarehouse(token?: string): Promise<{
        items: {
            batchId: string;
            batchName: string;
            image: string | null;
            quantity: number;
            mintedAt: Date;
            policyId: string | null;
        }[];
    }>;
    getLockRecipientByRoadmap(batchId: string | undefined, token: string | undefined): Promise<{
        recipientAddress: string | null;
    }>;
    removeWarehouseItem(body: RemoveWarehouseItemDto, token?: string): Promise<{
        ok: boolean;
    }>;
    markWarehouseItemShipped(body: RemoveWarehouseItemDto, token?: string): Promise<{
        ok: boolean;
    }>;
    mint(body: MintTraceDto, token?: string): Promise<{
        unsignedTx: string;
        policyId?: string;
    }>;
    update(body: UpdateTraceDto, token?: string): Promise<{
        unsignedTx: string;
    }>;
    revoke(body: RevokeTraceDto, token?: string): Promise<{
        unsignedTx: string;
    }>;
    burn(body: BurnTraceDto): Promise<{
        unsignedTx: string;
    }>;
    mintConfirm(body: MintConfirmDto, token?: string): Promise<{
        ok: boolean;
    }>;
    updateConfirm(body: UpdateConfirmDto, token?: string): Promise<{
        ok: boolean;
    }>;
    revokeConfirm(body: RevokeConfirmDto, token?: string): Promise<{
        ok: boolean;
    }>;
    burnConfirm(body: BurnConfirmDto): Promise<{
        ok: boolean;
    }>;
    submit(body: SubmitTxDto): Promise<{
        txHash: string;
    }>;
}
