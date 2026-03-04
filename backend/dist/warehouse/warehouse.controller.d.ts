import { AuthService } from "../auth/auth.service";
import { WarehouseService } from "./warehouse.service";
import { WarehouseBatchIdDto } from "./dto/warehouse.dto";
export declare class WarehouseController {
    private readonly warehouse;
    private readonly auth;
    constructor(warehouse: WarehouseService, auth: AuthService);
    getMyWarehouse(token?: string): Promise<{
        items: {
            batchId: string;
            batchName: string;
            image: string | null;
            receivedAt: Date;
            outAt: Date | null;
            policyId: string | null;
            status: string;
        }[];
    }>;
    removeItem(body: WarehouseBatchIdDto, token?: string): Promise<{
        ok: boolean;
    }>;
    markShipped(body: WarehouseBatchIdDto, token?: string): Promise<{
        ok: boolean;
    }>;
    getRecipientByRoadmap(batchId: string | undefined, token: string | undefined): Promise<{
        recipientAddress: string | null;
    }>;
}
