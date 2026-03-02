import { ProductRepositoryPort } from "../../domain/product.repository";
import { WarehouseService } from "../../../warehouse/warehouse.service";
export declare class RecordProductTxUseCase {
    private readonly repository;
    private readonly warehouse;
    constructor(repository: ProductRepositoryPort, warehouse: WarehouseService);
    execute(params: {
        action: "MINT" | "UPDATE" | "REVOKE" | "BURN";
        txHash: string;
        assetName: string;
        profileId: number;
        name?: string;
        description?: string;
        image?: string;
        standard?: string;
        properties?: object;
        metadata?: object;
        policyId?: string;
        receivers?: string[];
    }): Promise<void>;
}
