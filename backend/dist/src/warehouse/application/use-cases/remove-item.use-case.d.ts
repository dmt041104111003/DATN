import { WarehouseRepositoryPort } from "../../domain/warehouse.repository";
export declare class RemoveItemUseCase {
    private readonly repository;
    constructor(repository: WarehouseRepositoryPort);
    execute(profileId: number, batchId: string): Promise<void>;
}
