import { WarehouseInventoryItem, WarehouseRepositoryPort } from "./domain/warehouse.repository";
import { ListMyInventoryUseCase } from "./application/use-cases/list-my-inventory.use-case";
import { RemoveItemUseCase } from "./application/use-cases/remove-item.use-case";
import { MarkShippedUseCase } from "./application/use-cases/mark-shipped.use-case";
import { MarkBurnedUseCase } from "./application/use-cases/mark-burned.use-case";
import { AddToWarehouseUseCase } from "./application/use-cases/add-to-warehouse.use-case";
import { GetRecipientByRoadmapUseCase } from "./application/use-cases/get-recipient-by-roadmap.use-case";
export declare class WarehouseService {
    private readonly repository;
    private readonly listMyInventoryUseCase;
    private readonly removeItemUseCase;
    private readonly markShippedUseCase;
    private readonly markBurnedUseCase;
    private readonly addToWarehouseUseCase;
    private readonly getRecipientByRoadmapUseCase;
    constructor(repository: WarehouseRepositoryPort, listMyInventoryUseCase: ListMyInventoryUseCase, removeItemUseCase: RemoveItemUseCase, markShippedUseCase: MarkShippedUseCase, markBurnedUseCase: MarkBurnedUseCase, addToWarehouseUseCase: AddToWarehouseUseCase, getRecipientByRoadmapUseCase: GetRecipientByRoadmapUseCase);
    listMyWarehouseInventory(profileId: number): Promise<WarehouseInventoryItem[]>;
    removeOneFromWarehouse(profileId: number, batchId: string): Promise<void>;
    markAsShipped(profileId: number, batchId: string): Promise<void>;
    markAsBurned(profileId: number, batchId: string): Promise<void>;
    addToWarehouse(profileId: number, batchId: string): Promise<void>;
    getRecipientByRoadmap(profileId: number, batchId: string): Promise<{
        recipientAddress: string | null;
    }>;
}
