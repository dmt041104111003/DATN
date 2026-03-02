import { RecipientByRoadmapResult, WarehouseRepositoryPort } from "../../domain/warehouse.repository";
export declare class GetRecipientByRoadmapUseCase {
    private readonly repository;
    constructor(repository: WarehouseRepositoryPort);
    execute(profileId: number, batchId: string): Promise<RecipientByRoadmapResult>;
}
