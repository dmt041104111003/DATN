import { WarehouseInventoryItem, WarehouseRepositoryPort } from "../../domain/warehouse.repository";
export declare class ListMyInventoryUseCase {
    private readonly repository;
    constructor(repository: WarehouseRepositoryPort);
    execute(profileId: number): Promise<WarehouseInventoryItem[]>;
}
