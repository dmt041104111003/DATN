import { WarehouseRepositoryPort } from "../../domain/warehouse.repository";
export declare class MarkBurnedUseCase {
    private readonly repository;
    constructor(repository: WarehouseRepositoryPort);
    execute(profileId: number, batchId: string): Promise<void>;
}
