import { WarehouseRepositoryPort } from "../../domain/warehouse.repository";
export declare class MarkShippedUseCase {
    private readonly repository;
    constructor(repository: WarehouseRepositoryPort);
    execute(profileId: number, batchId: string): Promise<void>;
}
